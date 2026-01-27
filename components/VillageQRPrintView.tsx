
import React from 'react';
import { Village } from '../types';
import { UI_STRINGS } from '../constants';

interface VillageQRPrintViewProps {
  villages: Village[];
}

const VillageQRPrintView: React.FC<VillageQRPrintViewProps> = ({ villages }) => {
  const getVillageQR = (vId: string) => {
    const villageUrl = `${window.location.origin}/#/village/${vId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(villageUrl)}&bgcolor=ffffff&color=000000&margin=15`;
  };

  return (
    <div className="hidden print:block bg-white p-8 min-h-screen">
      <div className="text-center mb-16 border-b-4 border-indigo-900 pb-8">
        <h1 className="text-4xl font-black text-indigo-950 uppercase mb-4">{UI_STRINGS.appName}</h1>
        <h2 className="text-2xl font-black text-slate-500 uppercase tracking-[0.5em]">ग्राम क्यूआर कोड डायरेक्टरी</h2>
        <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">स्कैन करें और सीधे गाँव की डिजिटल डायरी तक पहुँचें</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {villages.filter(v => !v.isDeleted).sort((a,b) => a.name.localeCompare(b.name, 'hi')).map((v) => (
          <div key={v.id} className="border-2 border-slate-100 p-8 rounded-[3rem] flex flex-col items-center text-center break-inside-avoid">
            <div className="w-48 h-48 bg-white border-2 border-slate-50 p-3 rounded-[2rem] shadow-sm mb-6 flex items-center justify-center">
              <img 
                src={getVillageQR(v.id)} 
                alt={v.name} 
                className="w-full h-full object-contain" 
              />
            </div>
            <h3 className="text-2xl font-black text-indigo-950 mb-1">{v.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.tehsil} - {v.district}</p>
          </div>
        ))}
      </div>

      <footer className="mt-20 pt-10 border-t border-slate-100 text-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[1em]">{UI_STRINGS.copyright}</p>
      </footer>

      <style>{`
        @media print {
          @page { margin: 1cm; size: A4; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default VillageQRPrintView;
