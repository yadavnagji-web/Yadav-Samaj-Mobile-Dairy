
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
    <div className={`fixed inset-0 z-[100] bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex flex-col items-center justify-between text-white transition-opacity duration-700 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

      {/* Brand Header */}
      <div className="mt-20 text-center z-10 animate-fade-in-down">
        <div className="relative inline-block">
          <div className="w-28 h-28 bg-white rounded-full overflow-hidden flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,255,255,0.3)] border-4 border-amber-400">
            <img src={logoUrl} alt="Brand Logo" className="w-full h-full object-cover" />
          </div>
        </div>
        <h1 className="text-4xl font-black mt-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-200">{UI_STRINGS.appName}</h1>
        <p className="text-amber-400 text-xs font-black tracking-[0.4em] uppercase mt-2">BHIM Mobile Dairy</p>
      </div>

      {/* Panchang UI */}
      <div className="w-full px-8 z-10">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-8 shadow-2xl animate-float">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-amber-400"></div>
            <span className="text-amber-400 font-black tracking-widest text-[10px] uppercase">आज का पंचांग</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-amber-400"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 text-center py-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">दिनांक</p>
              <p className="text-2xl font-black">{panchang.dinank}</p>
            </div>
            <PanchangItem label="वार" val={panchang.vaar} />
            <PanchangItem label="माह" val={panchang.mahina} />
            <PanchangItem label="पक्ष" val={panchang.paksh} />
            <PanchangItem label="तिथि" val={panchang.tithi} />
          </div>
        </div>
      </div>

      <div className="mb-14 text-center z-10">
        <div className="flex items-center justify-center space-x-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
        <p className="text-[10px] font-black text-blue-200/50 uppercase tracking-[0.5em] mt-4">Developing Digital Villages</p>
      </div>

      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-fade-in-down { animation: fade-in-down 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const PanchangItem = ({ label, val }: any) => (
  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
    <p className="text-[9px] text-amber-300 font-bold uppercase tracking-widest mb-1 opacity-70">{label}</p>
    <p className="text-lg font-black">{val}</p>
  </div>
);

export default LaunchingPage;
