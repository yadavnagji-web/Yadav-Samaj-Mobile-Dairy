import { GoogleGenAI, Type } from "@google/genai";

// API Key check to make it optional
const API_KEY = process.env.API_KEY;

/**
 * Helper to get Gemini Instance if API key is available
 */
function getAI() {
  if (!API_KEY || API_KEY === "") {
    console.warn("Gemini API Key missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey: API_KEY });
}

/**
 * Parses smart intents for the overall assistant navigation and actions.
 */
export async function parseSmartIntent(query: string) {
  const ai = getAI();
  if (!ai) return { intent: "DISABLED", message: "AI सुविधा फिलहाल उपलब्ध नहीं है (Missing API Key)।" };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `उपयोगकर्ता ने कहा: "${query}". 
      इस इनपुट से उपयोगकर्ता का इरादा (Intent) समझें और JSON में जवाब दें।
      
      मान्य Intents:
      1. NAVIGATE_VILLAGE (पैरामीटर: village_name) - किसी विशिष्ट गाँव को खोलने के लिए।
      2. SEARCH_CONTACT (पैरामीटर: search_term) - किसी व्यक्ति या पेशे को खोजने के लिए।
      3. NAVIGATE_HOME - वापस मुख्य स्क्रीन पर जाने के लिए।
      4. SHOW_BULLETINS - गाँव की सूचनाएं देखने के लिए।
      5. HELP - यह पूछने पर कि ऐप कैसे काम करता है।

      महत्वपूर्ण नियम:
      - यदि उपयोगकर्ता "डिलीट", "हटाना", "सुधारना" या "एडिट" (Delete/Edit) जैसी कोई भी बात कहे, तो Intent "FORBIDDEN" दें।
      - भाषा: हिंदी/हिंग्लिश।`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { 
              type: Type.STRING, 
              description: "NAVIGATE_VILLAGE, SEARCH_CONTACT, NAVIGATE_HOME, SHOW_BULLETINS, HELP, FORBIDDEN" 
            },
            village_name: { type: Type.STRING, nullable: true },
            search_term: { type: Type.STRING, nullable: true },
            message: { type: Type.STRING, description: "उपयोगकर्ता को देने के लिए छोटा सा प्यारा जवाब (Hindi)" }
          },
          required: ["intent", "message"]
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Intent Parsing Error:", error);
    return null;
  }
}

/**
 * Parses simple voice search queries for names, villages, or professions.
 */
export async function parseVoiceQuery(query: string) {
  const ai = getAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract search parameters (village, name, or profession) from this voice query: "${query}". Respond in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            village: { type: Type.STRING, nullable: true },
            name: { type: Type.STRING, nullable: true },
            profession: { type: Type.STRING, nullable: true }
          }
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Voice Query Error:", error);
    return null;
  }
}