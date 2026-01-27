
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Cache for settings to avoid prop drilling in simple services
let cachedSettings: any = null;
export const updateServiceSettings = (settings: any) => {
  cachedSettings = settings;
};

async function callGroq(prompt: string, schema?: any) {
  // Use Firebase stored key first
  const groqKey = cachedSettings?.aiKeySecondary;
  if (!groqKey) return null;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `You are a helpful assistant for BHIM Mobile Dairy. Always respond in JSON format matching this schema: ${JSON.stringify(schema)}. Output MUST be valid JSON only.`
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    console.error("Groq Fallback Failed", e);
    return null;
  }
}

export async function parseSmartIntent(query: string) {
  // Priority: Firebase Key > ENV Key
  const activeKey = cachedSettings?.aiKeyPrimary || process.env.API_KEY;
  if (!activeKey) return await callGroq(query, {});

  const ai = new GoogleGenAI({ apiKey: activeKey });
  const schema = {
    type: Type.OBJECT,
    properties: {
      intent: { type: Type.STRING },
      village_name: { type: Type.STRING },
      search_term: { type: Type.STRING },
      message: { type: Type.STRING }
    },
    required: ["intent", "message"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `उपयोगकर्ता: "${query}". Intents: NAVIGATE_VILLAGE, SEARCH_CONTACT, NAVIGATE_HOME, HELP. केवल हिंदी में उत्तर दें।`,
      config: { responseMimeType: "application/json", responseSchema: schema as any },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.warn("Gemini Failed, switching to Groq...");
    return await callGroq(query, schema);
  }
}

export async function parseVoiceQuery(query: string) {
  const activeKey = cachedSettings?.aiKeyPrimary || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: activeKey });
  const schema = {
    type: Type.OBJECT,
    properties: {
      village: { type: Type.STRING },
      name: { type: Type.STRING },
      profession: { type: Type.STRING }
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `आवाज़ खोज: "${query}". गाँव, नाम या पेशा निकालें।`,
      config: { responseMimeType: "application/json", responseSchema: schema as any },
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.warn("Gemini Voice Parse Failed, switching to Groq...");
    return await callGroq(query, schema);
  }
}

export async function speakText(text: string) {
  const activeKey = cachedSettings?.aiKeyPrimary || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: activeKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `बोलें: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) await playRawAudio(base64Audio);
  } catch (error) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'hi-IN';
    synth.speak(utter);
  }
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

async function playRawAudio(base64: string) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start();
}
