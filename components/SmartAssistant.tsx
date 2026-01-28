
import React, { useState, useEffect, useRef } from 'react';
import { parseSmartIntent, speakText } from '../services/geminiService';
import { syncCollection } from '../services/firebase';

interface SmartAssistantProps { onAction: (action: any) => void; }

const SmartAssistant: React.FC<SmartAssistantProps> = ({ onAction }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [sysPrompt, setSysPrompt] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Fetch settings for system prompt
    const unsub = syncCollection('app_settings', (s) => {
      const global = s.find(item => item.id === 'global');
      if (global) {
        setSysPrompt(global.aiSystemPrompt || '');
      }
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
        setFeedback(`समझ रहा हूँ: "${text}"`);
        
        // Use Gemini Service instead of Groq
        const result = await parseSmartIntent(text, sysPrompt);
        if (result) {
          setFeedback(result.message);
          speakText(result.message);
          onAction(result);
        } else {
          const failMsg = "क्षमा करें, मैं समझ नहीं पाया।";
          setFeedback(failMsg);
          speakText(failMsg);
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
  }, [onAction, sysPrompt]);

  const startListening = () => {
    if (isProcessing || isListening) return;
    setFeedback("बोलिए, मैं सुन रहा हूँ..."); 
    setIsListening(true); 
    recognitionRef.current?.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end pointer-events-none">
      {feedback && (
        <div className="mb-6 bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-indigo-100 text-[11px] font-bold text-indigo-950 animate-fade-in pointer-events-auto max-w-[220px] text-center tracking-tight border-b-4 border-b-[#FF33CC]">
          {feedback}
        </div>
      )}
      <button
        onClick={startListening}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-90 pointer-events-auto relative pulse-mic ${
          isListening ? 'bg-rose-500' : 'bg-black'
        }`}
      >
        {isProcessing ? (
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        )}
      </button>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .pulse-mic { box-shadow: 0 0 0 0 rgba(255, 51, 204, 0.4); animation: pulse-pink 2s infinite; }
        @keyframes pulse-pink {
          0% { box-shadow: 0 0 0 0 rgba(255, 51, 204, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(255, 51, 204, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 51, 204, 0); }
        }
      `}</style>
    </div>
  );
};

export default SmartAssistant;
