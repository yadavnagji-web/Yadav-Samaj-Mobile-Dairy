
import React, { useState, useEffect, useRef } from 'react';
import { parseSmartIntent as parseGroqIntent, speakText } from '../services/groqService';
import { parseSmartIntent as parseGeminiIntent } from '../services/geminiService';
import { syncCollection, addToCloud } from '../services/firebase';

interface SmartAssistantProps { onAction: (action: any) => void; }

const SmartAssistant: React.FC<SmartAssistantProps> = ({ onAction }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const unsub = syncCollection('app_settings', (s) => {
      const global = s.find(item => item.id === 'global');
      if (global) setSettings(global);
    });

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'hi-IN';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setIsListening(false);
        setIsProcessing(true);
        setFeedback(`AI समझ रहा है: "${text}"`);
        
        let result = null;
        let providerUsed = 'Gemini';
        
        try {
          const systemPrompt = settings?.aiSystemPrompt || `You are BHIM, a smart assistant for Yadav Samaj app.
          Intents: NAVIGATE_VILLAGE, SEARCH_CONTACT, NAVIGATE_HOME, HELP.
          If user asks "How to...", "Explain...", or general questions about the app, use HELP intent and provide a clear Hindi message.
          Format: {"intent": "STRING", "village_name": "STRING", "message": "Clear Hindi Response"}`;

          if (settings?.groqApiKey) {
            result = await parseGroqIntent(text, settings.groqApiKey, systemPrompt);
            providerUsed = 'Groq';
          } else {
            result = await parseGeminiIntent(text, systemPrompt);
          }

          // Save to database
          await addToCloud('ai_logs', {
            query: text,
            response: result?.message || "संसाधित किया गया",
            intent: result?.intent || "UNKNOWN",
            provider: providerUsed,
            timestamp: new Date().toISOString()
          });

          if (result && result.intent) {
            setFeedback(result.message || "ठीक है।");
            speakText(result.message || "ठीक है।");
            onAction(result);
          } else {
            setFeedback("क्षमा करें, मैं इसे अभी नहीं कर सकता।");
            speakText("क्षमा करें, मैं इसे अभी नहीं कर सकता।");
          }
        } catch (error) {
          console.error("AI Error", error);
          setFeedback("सिस्टम एरर!");
        }
        
        setTimeout(() => { setIsProcessing(false); setFeedback(''); }, 4000);
      };
      
      recognitionRef.current.onerror = () => { 
        setIsListening(false); 
        setFeedback("त्रुटि!"); 
        setTimeout(() => setFeedback(''), 2000); 
      };
    }
    return () => unsub();
  }, [onAction, settings]);

  const startListening = () => {
    if (isProcessing || isListening) return;
    if (!settings?.groqApiKey && !process.env.API_KEY) {
      alert("AI सेवाएं सक्रिय नहीं हैं।");
      return;
    }
    setFeedback("बोलिए..."); 
    setIsListening(true); 
    try { recognitionRef.current?.start(); } catch { setIsListening(false); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[10000] flex flex-col items-end pointer-events-none">
      {feedback && (
        <div className="mb-6 bg-white px-6 py-4 rounded-3xl shadow-2xl border-2 border-indigo-50 text-[10px] font-black text-indigo-950 animate-fade-in pointer-events-auto max-w-[200px] text-center">
          {feedback}
        </div>
      )}
      <button
        onClick={startListening}
        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all transform active:scale-90 pointer-events-auto pulse-mic ${
          isListening ? 'bg-rose-500 scale-110' : 'bg-black'
        }`}
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        )}
      </button>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SmartAssistant;
