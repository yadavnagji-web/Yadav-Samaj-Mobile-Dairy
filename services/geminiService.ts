
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Helper to initialize AI right before use as per guidelines to ensure the latest API key is used
function getAI() {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "") return null;
  return new GoogleGenAI({ apiKey });
}

export async function parseSmartIntent(query: string) {
  const ai = getAI();
  if (!ai) return { intent: "DISABLED", message: "AI सुविधा फिलहाल उपलब्ध नहीं है।" };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `उपयोगकर्ता ने कहा: "${query}". 
      केवल हिंदी में जवाब दें।
      Intents: NAVIGATE_VILLAGE, SEARCH_CONTACT, NAVIGATE_HOME, HELP, FORBIDDEN.
      नियम: केवल हिंदी भाषा का प्रयोग करें।`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            village_name: { type: Type.STRING, nullable: true },
            search_term: { type: Type.STRING, nullable: true },
            message: { type: Type.STRING }
          },
          required: ["intent", "message"]
        },
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) { return null; }
}

/**
 * Parses natural language voice queries into search filters.
 * Fixes: Module '"../services/geminiService"' has no exported member 'parseVoiceQuery'.
 */
export async function parseVoiceQuery(query: string) {
  const ai = getAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `उपयोगकर्ता की आवाज़ खोज: "${query}". 
      संभावित गाँव का नाम, व्यक्ति का नाम या पेशा निकालें।
      केवल हिंदी में परिणाम दें।`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            village: { type: Type.STRING, nullable: true },
            name: { type: Type.STRING, nullable: true },
            profession: { type: Type.STRING, nullable: true }
          },
        },
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Voice Query Parse Error", error);
    return null;
  }
}

export async function speakText(text: string) {
  const ai = getAI();
  if (!ai) return;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `हिंदी में स्पष्ट बोलें: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) await playRawAudio(base64Audio);
  } catch (error) { console.error("TTS Error", error); }
}

// Manual implementation of decode as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Audio decoding following the recommended pattern in the guidelines
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Decodes and plays raw PCM audio data from the model.
 */
async function playRawAudio(base64: string) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(
    decode(base64),
    ctx,
    24000,
    1
  );
  
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start();
}
