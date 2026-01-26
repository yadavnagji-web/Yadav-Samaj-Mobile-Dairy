
import React, { useState, useEffect, useRef } from 'react';
import { parseSmartIntent, speakText } from '../services/geminiService';

interface SmartAssistantProps {
  onAction: (action: any) => void;
}

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
        setFeedback(`समझ रहा हूँ: "${text}"...`);
        
        const result = await parseSmartIntent(text);
        if (result) {
          if (result.intent === 'FORBIDDEN') {
            const msg = "क्षमा करें, मुझे डेटा डिलीट या एडिट करने की अनुमति नहीं है।";
            setFeedback(msg);
            speakText(msg);
          } else if (result.intent === 'DISABLED') {
            setFeedback(result.message);
          } else {
            setFeedback(result.message);
            // AI Speaks the action it is taking
            speakText(result.message);
            onAction(result);
          }
        } else {
          const failMsg = "माफ़ कीजिये, मैं समझ नहीं पाया। कृपया फिर से कहें।";
          setFeedback(failMsg);
          speakText(failMsg);
        }
        
        setTimeout(() => {
          setIsProcessing(false);
          setFeedback('');
        }, 4000);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setFeedback("आवाज़ रिकॉर्ड नहीं हो पाई।");
        setTimeout(() => setFeedback(''), 2000);
      };
    }
  }, [onAction]);

  const startListening = () => {
    if (isProcessing) return;
    
    if (!process.env.API_KEY) {
       setFeedback("AI सुविधा के लिए API Key आवश्यक है।");
       setTimeout(() => setFeedback(''), 3000);
       return;
    }

    setFeedback("बोलिए, मैं सुन रहा हूँ...");
    setIsListening(true);
    recognitionRef.current?.start();
  };

  return (
    <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end pointer-events-none">
      {feedback && (
        <div className="mb-4 bg-white px-5 py-3 rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-blue-50 text-sm font-black text-indigo-800 animate-fade-in pointer-events-auto max-w-[220px] text-center leading-relaxed">
          <div className="flex items-center justify-center mb-1">
             <span className="flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
             </span>
             {isProcessing ? 'प्रोसेसिंग...' : 'BHIM AI'}
          </div>
          {feedback}
        </div>
      )}
      
      <button
        onClick={startListening}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all transform active:scale-90 pointer-events-auto ${
          isListening ? 'bg-red-500 animate-pulse' : 
          isProcessing ? 'bg-amber-500' : 'bg-indigo-600'
        }`}
      >
        {isProcessing ? (
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>
        )}
      </button>
      <p className="mt-2 text-[10px] font-black text-indigo-900 bg-white/90 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">BHIM AI सहायक</p>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SmartAssistant;
