
import React, { useState, useEffect, useRef } from 'react';
import { parseSmartIntent, speakText } from '../services/geminiService';

interface SmartAssistantProps { onAction: (action: any) => void; }

const SmartAssistant: React.FC<SmartAssistantProps> = ({ onAction }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
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
        setFeedback(`Analyzing: "${text}"`);
        const result = await parseSmartIntent(text);
        if (result) {
          setFeedback(result.message);
          speakText(result.message);
          onAction(result);
        } else {
          const failMsg = "मैं समझ नहीं पाया।";
          setFeedback(failMsg);
          speakText(failMsg);
        }
        setTimeout(() => { setIsProcessing(false); setFeedback(''); }, 4000);
      };
      recognitionRef.current.onerror = () => { setIsListening(false); setFeedback("नेटवर्क त्रुटि!"); setTimeout(() => setFeedback(''), 2000); };
    }
  }, [onAction]);

  const startListening = () => {
    if (isProcessing) return;
    setFeedback("सुन रहा हूँ..."); setIsListening(true); recognitionRef.current?.start();
  };

  return (
    <div className="fixed bottom-[110px] right-6 z-[100] flex flex-col items-end pointer-events-none">
      {feedback && (
        <div className="mb-5 bg-white/90 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white text-[11px] font-black text-indigo-950 animate-fade-in pointer-events-auto max-w-[200px] text-center tracking-tight border-b-8 border-b-indigo-500">
          {feedback}
        </div>
      )}
      <button
        onClick={startListening}
        className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center shadow-2xl transition-all transform active:scale-90 pointer-events-auto relative ${
          isListening ? 'bg-gradient-to-br from-rose-500 to-pink-500' : isProcessing ? 'bg-gradient-to-br from-indigo-700 to-purple-800 animate-pulse' : 'bg-gradient-to-br from-indigo-600 to-purple-600'
        }`}
      >
        {isListening && <div className="absolute inset-0 rounded-[1.75rem] bg-rose-500 animate-ping opacity-40"></div>}
        {isProcessing ? (
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        )}
      </button>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default SmartAssistant;
