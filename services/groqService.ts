
/**
 * BHIM Mobile Dairy - Groq AI Service
 * This service handles all NLP tasks exclusively using Groq Cloud API.
 */

export async function queryGroqAI(query: string, apiKey: string, systemPrompt: string) {
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.6,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI Error:", error);
    return null;
  }
}

/**
 * Parses user intent for navigation and search using Groq.
 */
export async function parseSmartIntent(query: string, apiKey: string, customPrompt?: string) {
  const systemPrompt = customPrompt || `You are BHIM, an AI intent parser for Yadav Samaj directory.
  Extract intent from Hindi query. Intents: NAVIGATE_VILLAGE, SEARCH_CONTACT, NAVIGATE_HOME, HELP.
  Return ONLY a valid JSON object. 
  Format: {"intent": "STRING", "village_name": "STRING", "search_term": "STRING", "message": "STRING (Polite Hindi reply)"}`;

  const rawResult = await queryGroqAI(query, apiKey, systemPrompt);
  try {
    return JSON.parse(rawResult || '{}');
  } catch (e) {
    console.error("Failed to parse Groq JSON", rawResult);
    return { intent: 'HELP', message: 'क्षमा करें, मैं समझ नहीं पाया।' };
  }
}

/**
 * Parses voice query into village, name or profession using Groq.
 */
export async function parseVoiceQuery(query: string, apiKey: string) {
  const systemPrompt = `You are BHIM. Extract village, name, or profession from the voice input in Hindi.
  Return ONLY a valid JSON object.
  Format: {"village": "STRING", "name": "STRING", "profession": "STRING"}`;
  
  const rawResult = await queryGroqAI(query, apiKey, systemPrompt);
  try {
    return JSON.parse(rawResult || '{}');
  } catch (e) {
    return null;
  }
}

/**
 * Browser-based Speech Synthesis for Hindi (Replacing Gemini TTS)
 */
export function speakText(text: string) {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  // Find a Hindi voice if available
  const voices = window.speechSynthesis.getVoices();
  const hiVoice = voices.find(v => v.lang.includes('hi'));
  if (hiVoice) utterance.voice = hiVoice;
  
  window.speechSynthesis.speak(utterance);
}
