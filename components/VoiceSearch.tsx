import React, { useState, useEffect, useRef } from 'react';
import { parseVoiceQuery } from '../services/geminiService';

interface VoiceSearchProps {
  onResult: (parsed: { village?: string; name?: string; profession?: string } | null, originalText: string) => void;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
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
        setTranscript(text);
        setIsListening(false);
        
        // Only try AI parsing if Key exists
        if (process.env.API_KEY) {
          const parsed = await parseVoiceQuery(text);
          onResult(parsed, text);
        } else {
          // Fallback to text directly
          onResult(null, text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, [onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggleListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
          isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
      {isListening && <p className="mt-2 text-red-600 font-medium animate-bounce text-sm">सुन रहा हूँ... बोलिये</p>}
      {transcript && !isListening && (
        <p className="mt-2 text-slate-600 italic text-sm">आपने कहा: "{transcript}"</p>
      )}
    </div>
  );
};

export default VoiceSearch;