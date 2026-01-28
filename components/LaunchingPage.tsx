
import React, { useEffect, useState } from 'react';
import { getHindiDateInfo } from '../utils/hindiCalendar';
import { UI_STRINGS, AMBEDKAR_THOUGHTS } from '../constants';

interface LaunchingPageProps {
  onComplete: () => void;
}

const LaunchingPage: React.FC<LaunchingPageProps> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [thought, setThought] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setInfo(getHindiDateInfo());
    const randomIdx = new Date().getDate() % AMBEDKAR_THOUGHTS.length;
    setThought(AMBEDKAR_THOUGHTS[randomIdx]);

    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          handleEnter();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  const handleEnter = () => {
    setFade(true);
    setTimeout(onComplete, 800);
  };

  if (!info) return null;

  return (
    <div className={`fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-between transition-all duration-1000 overflow-hidden ${fade ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
      
      <div className="absolute top-[-20%] right-[-20%] w-[120vw] h-[120vw] bg-[#FF33CC] rounded-full blur-[160px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-15%] w-[90vw] h-[90vw] bg-black rounded-full blur-[140px] opacity-10"></div>

      <div className="relative z-10 w-full pt-16 px-8 flex flex-col items-center animate-slide-down">
        <h1 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter text-center leading-[1.1]">
          यादव समाज <br/> <span className="text-indigo-600">वागड़ चौरासी</span>
        </h1>
        <div className="h-1.5 w-32 bg-black mt-6 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full px-6 flex flex-col items-center animate-fade-in delay-200">
         <div className="bg-black text-white px-6 py-2 rounded-full mb-8 shadow-2xl flex items-center space-x-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">आज का शुभ पंचांग</p>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full max-w-4xl place-items-center">
            <PanchangChip label="दिनांक" value={info.dinank} />
            <PanchangChip label="वार" value={info.vaar} />
            <PanchangChip label="हिन्दी माह" value={info.mahina} />
            <PanchangChip label="पक्ष" value={info.paksh} />
            <PanchangChip label="तिथि" value={info.tithi} />
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full">
        <div className="w-full max-w-sm animate-float">
           <div className="bg-white/40 backdrop-blur-3xl border border-white p-10 md:p-14 rounded-[4.5rem] shadow-2xl shadow-black/5 relative group">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center shadow-2xl">
                 <span className="text-4xl">📚</span>
              </div>
              
              <div className="text-center space-y-8 mt-6">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em]">आज का विचार</p>
                <p className="text-xl md:text-2xl font-black text-black italic leading-[1.4] tracking-tight">
                  "{thought}"
                </p>
                <div className="pt-4 flex flex-col items-center">
                  <div className="h-0.5 w-10 bg-black/10 mb-3"></div>
                  <p className="text-[11px] font-black text-black/40 uppercase tracking-[0.3em]">डॉ. बी.आर. अंबेडकर</p>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="w-full relative pb-16 px-10 flex flex-col items-center z-10 animate-slide-up">
        <div className="w-full max-w-xs space-y-4">
           <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black transition-all duration-100 ease-linear" 
                style={{ width: `${progress}%` }}
              ></div>
           </div>
           <div className="flex justify-between items-center opacity-40">
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">BHIM DIARY...</span>
              <span className="text-[9px] font-black">{Math.round(progress)}%</span>
           </div>
        </div>
        <p className="mt-8 text-[9px] font-black text-black/20 uppercase tracking-[0.4em]">{UI_STRINGS.copyright}</p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(1deg); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        @keyframes slideDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-down { animation: slideDown 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 1.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

const PanchangChip = ({ label, value }: any) => (
  <div className="w-full p-4 rounded-[2rem] border border-black/5 bg-white text-black shadow-sm text-center">
    <p className="text-[8px] font-black uppercase tracking-widest mb-1.5 text-black/30">{label}</p>
    <p className="text-[11px] font-black truncate">{value}</p>
  </div>
);

export default LaunchingPage;
