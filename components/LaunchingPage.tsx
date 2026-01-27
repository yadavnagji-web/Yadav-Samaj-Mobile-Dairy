
import React, { useEffect, useState } from 'react';
import { getHindiDateInfo } from '../utils/hindiCalendar';
import { UI_STRINGS } from '../constants';

interface LaunchingPageProps {
  onComplete: () => void;
}

const LaunchingPage: React.FC<LaunchingPageProps> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    setInfo(getHindiDateInfo());
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onComplete, 1000);
    }, 4500); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!info) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 flex flex-col items-center justify-between transition-all duration-1000 overflow-hidden ${fade ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
      
      {/* Animated Bubbles for "Happy" look */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl animate-bounce"></div>
      
      {/* Top Section - Today's Info */}
      <div className="pt-16 px-6 text-center animate-slide-down w-full relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white/20 shadow-2xl mb-6">
          <p className="text-white text-xl font-black leading-tight mb-4 italic drop-shadow-lg">
            "{UI_STRINGS.tagline}"
          </p>
          <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent w-40 mx-auto mb-6 rounded-full"></div>
          
          <div className="flex flex-wrap justify-center gap-3 text-[11px] font-black uppercase tracking-widest">
            <span className="bg-white/20 text-white px-5 py-2 rounded-full border border-white/30">{info.vaar}</span>
            <span className="bg-white/20 text-white px-5 py-2 rounded-full border border-white/30">{info.dinank}</span>
          </div>
        </div>
      </div>

      {/* Center Section - Branding Name only */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 relative z-10">
        <div className="text-center animate-pop-in">
          <h2 className="text-4xl font-black text-white drop-shadow-2xl tracking-tight uppercase leading-none">
            {UI_STRINGS.shortName}
          </h2>
          <p className="text-white/60 text-[10px] mt-2 font-light tracking-[0.3em] uppercase">{UI_STRINGS.appName}</p>
          <div className="mt-8 inline-block bg-amber-400 text-indigo-900 px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl">
            डिजिटल मोबाइल डायरी
          </div>
        </div>
      </div>

      {/* Bottom Section - Footer */}
      <div className="pb-16 text-center space-y-4 relative z-10">
        <div className="flex flex-col items-center opacity-60">
           <div className="w-12 h-12 bg-white rounded-xl p-1 shadow-lg border border-white/20 mb-3">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${window.location.origin}`} className="w-full h-full" alt="QR" />
           </div>
           <p className="text-white text-[9px] font-black uppercase tracking-[0.5em]">Digital Directory 2026</p>
        </div>
      </div>

      <style>{`
        @keyframes popIn { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: popIn 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes slideDown { 0% { transform: translateY(-60px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-slide-down { animation: slideDown 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default LaunchingPage;
