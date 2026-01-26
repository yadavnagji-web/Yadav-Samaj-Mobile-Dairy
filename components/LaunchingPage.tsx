
import React, { useEffect, useState } from 'react';
import { getHindiDateInfo } from '../utils/hindiCalendar';
import { UI_STRINGS } from '../constants';

interface LaunchingPageProps {
  onComplete: () => void;
  logoUrl: string;
}

const LaunchingPage: React.FC<LaunchingPageProps> = ({ onComplete, logoUrl }) => {
  const [panchang, setPanchang] = useState(getHindiDateInfo());
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onComplete, 800);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#0f172a] flex flex-col items-center justify-between text-white transition-opacity duration-700 overflow-hidden ${fade ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Brand Header Section */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full px-6 text-center animate-fade-in-down">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
          <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-full overflow-hidden flex items-center justify-center shadow-2xl border-4 border-amber-400 p-1">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-200">
            {UI_STRINGS.fullAppName}
          </span>
        </h1>
        <div className="mt-4 flex items-center justify-center space-x-2">
          <div className="h-[2px] w-8 bg-amber-400/50"></div>
          <p className="text-amber-400 text-[10px] font-black tracking-[0.3em] uppercase">Vagad Chaurasi Region</p>
          <div className="h-[2px] w-8 bg-amber-400/50"></div>
        </div>
      </div>

      {/* Panchang UI Section - Fixed Spacing to avoid overlap */}
      <div className="w-full px-6 mb-12 z-10 max-w-md animate-float">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl">
          <div className="text-center mb-4">
            <span className="text-amber-400 font-black tracking-widest text-[10px] uppercase bg-white/5 px-4 py-1 rounded-full border border-white/10">आज का पंचांग</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 text-center py-3 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[9px] text-blue-300 font-bold uppercase tracking-widest mb-0.5">आज की तिथि</p>
              <p className="text-xl font-black">{panchang.dinank}</p>
            </div>
            <PanchangItem label="वार" val={panchang.vaar} />
            <PanchangItem label="माह" val={panchang.mahina} />
            <PanchangItem label="पक्ष" val={panchang.paksh} />
            <PanchangItem label="तिथि" val={panchang.tithi} />
          </div>
        </div>
      </div>

      {/* Loading Footer */}
      <div className="pb-12 text-center z-10">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">डिजिटल इंडिया • डिजिटल समाज</p>
      </div>

      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-fade-in-down { animation: fade-in-down 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const PanchangItem = ({ label, val }: { label: string, val: string }) => (
  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
    <p className="text-[8px] text-amber-300 font-bold uppercase tracking-widest mb-0.5 opacity-70">{label}</p>
    <p className="text-base font-black truncate">{val}</p>
  </div>
);

export default LaunchingPage;
