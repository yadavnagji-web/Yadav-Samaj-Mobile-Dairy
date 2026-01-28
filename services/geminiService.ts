
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Use process.env.API_KEY exclusively as per guidelines.
// Assume it is pre-configured and accessible.
// Always use the apiKey parameter directly from process.env.API_KEY.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses user natural language query into specific application intents.
 */
export async function parseSmartIntent(query: string, customSystemInstruction?: string) {
  const ai = getAI();
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

  const systemInstruction = customSystemInstruction || "You are BHIM, an AI intent parser for Yadav Samaj directory. Extract intent from Hindi query. Intents: NAVIGATE_VILLAGE, SEARCH_CONTACT, NAVIGATE_HOME, HELP. केवल हिंदी में उत्तर दें।";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `उपयोगकर्ता: "${query}"`,
      config: { 
        systemInstruction,
        responseMimeType: "application/json", 
        responseSchema: schema 
      },
    });
    // Accessing .text as a property as per guidelines.
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Intent Parse Failed", error);
    return null;
  }
}

/**
 * Extract entities from voice query for contact search.
 */
export async function parseVoiceQuery(query: string) {
  const ai = getAI();
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
      config: { 
        responseMimeType: "application/json", 
        responseSchema: schema 
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Gemini Voice Parse Failed", e);
    return null;
  }
}

/**
 * Converts text to speech using Gemini TTS model.
 */
export async function speakText(text: string) {
  const ai = getAI();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `बोलें: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: 'Kore' } 
          } 
        },
      },
    });
    
    // Extract base64 audio data from the first candidate's first part.
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      await playRawAudio(base64Audio);
    }
  } catch (error) {
    console.error("Gemini TTS Failed, falling back to browser synthesis", error);
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'hi-IN';
    synth.speak(utter);
  }
}

/**
 * Standard base64 decoding function as per SDK examples.
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio bytes into an AudioBuffer.
 */
async function decodeAudioData(
  data: Uint8Array, 
  ctx: AudioContext, 
  sampleRate: number, 
  numChannels: number
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
 * Plays raw audio data using Web Audio API.
 */
async function playRawAudio(base64: string) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start();
}
