
import React from 'react';
import { Contact, Village } from '../types';
import { UI_STRINGS, BRAND_LOGO_URL } from '../constants';

interface FullPrintViewProps {
  contacts: Contact[];
  villages: Village[];
}

const FullPrintView: React.FC<FullPrintViewProps> = ({ contacts, villages }) => {
  // Filter deleted and sort contacts by village then by name
  const sortedContacts = [...contacts]
    .filter(c => !c.isDeleted)
    .sort((a, b) => {
      const vA = villages.find(v => v.id === a.villageId)?.name || 'ZZZ';
      const vB = villages.find(v => v.id === b.villageId)?.name || 'ZZZ';
      if (vA !== vB) return vA.localeCompare(vB, 'hi');
      return a.name.localeCompare(b.name, 'hi');
    });

  // Group by village for better organization
  const groupedContacts: Record<string, { village: Village; list: Contact[] }> = {};
  villages.filter(v => !v.isDeleted).forEach(v => {
    groupedContacts[v.name] = { 
      village: v, 
      list: sortedContacts.filter(c => c.villageId === v.id) 
    };
  });

  return (
    <div className="hidden print:block bg-white text-slate-900 p-0">
      {/* Cover Page */}
      <div className="min-h-screen flex flex-col items-center justify-center p-20 text-center border-8 border-indigo-900 m-8 break-after-page">
        <div className="w-64 h-64 mb-16 border-4 border-indigo-900 p-8 rounded-full flex items-center justify-center">
           <img src={BRAND_LOGO_URL} className="w-full h-full object-contain grayscale" alt="Logo" />
        </div>
        <h1 className="text-6xl font-black mb-8 leading-tight">{UI_STRINGS.appName}</h1>
        <div className="h-2 bg-indigo-900 w-64 mx-auto mb-12"></div>
        <p className="text-3xl font-black text-slate-500 uppercase tracking-[0.5em] mb-16">{UI_STRINGS.shortName}</p>
        <p className="text-2xl font-black italic text-indigo-800">"{UI_STRINGS.tagline}"</p>
        <div className="mt-32 pt-20 border-t border-slate-200 w-full">
           <p className="text-sm font-bold text-slate-400 tracking-widest">{UI_STRINGS.copyright}</p>
           <p className="text-sm font-black mt-2">कुल सदस्य: {sortedContacts.length} | कुल गाँव: {villages.filter(v=>!v.isDeleted).length}</p>
        </div>
      </div>

      {/* Village Lists */}
      <div className="p-10">
        {Object.entries(groupedContacts).map(([vName, data]) => (
          <div key={vName} className="mb-20 break-inside-avoid-page">
            <div className="flex items-center justify-between border-b-8 border-indigo-950 pb-6 mb-10">
               <div>
                 <h2 className="text-5xl font-black text-indigo-950 uppercase">{vName}</h2>
                 <p className="text-xl font-bold text-slate-400 mt-2 uppercase tracking-widest">{data.village.tehsil} - {data.village.district}</p>
               </div>
               <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-600">गाँव डायरेक्टरी</p>
                    <p className="text-2xl font-black">{data.list.length} सदस्य</p>
                  </div>
                  <div className="w-24 h-24 bg-white border-2 border-slate-100 p-1 rounded-2xl shadow-sm">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/#/village/${data.village.id}`} className="w-full h-full" alt="VQR" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {data.list.map((c) => (
                <div key={c.id} className="border-2 border-slate-100 p-5 rounded-3xl flex items-center justify-between shadow-sm break-inside-avoid">
                  <div className="flex-1">
                    <h3 className="text-lg font-black leading-tight mb-1">{c.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">पिता: {c.fatherName}</p>
                    <p className="text-xl font-black text-indigo-900 tracking-tighter">{c.mobile}</p>
                  </div>
                  <div className="w-16 h-16 bg-white border border-slate-100 p-1 rounded-2xl ml-4 shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=tel:${c.mobile}`} 
                      className="w-full h-full object-contain" 
                      alt="QR" 
                    />
                  </div>
                </div>
              ))}
            </div>
            {data.list.length === 0 && (
              <p className="text-center py-20 text-slate-300 font-black uppercase text-xl tracking-widest border-2 border-dashed border-slate-100 rounded-[3rem]">इस गाँव में कोई सदस्य नहीं मिला</p>
            )}
          </div>
        ))}
      </div>

      {/* Final QR Code Index Page */}
      <div className="min-h-screen p-20 break-before-page flex flex-col">
         <div className="text-center mb-16">
           <h2 className="text-4xl font-black text-indigo-950 uppercase mb-4">ग्राम क्यूआर कोड निर्देशिका</h2>
           <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Quick Scan Village Access</p>
         </div>
         <div className="grid grid-cols-4 gap-12 flex-1">
            {villages.filter(v=>!v.isDeleted).sort((a,b)=>a.name.localeCompare(b.name,'hi')).map(v => (
              <div key={v.id} className="text-center border-2 border-slate-50 p-8 rounded-[3.5rem] shadow-sm flex flex-col items-center">
                 <div className="w-40 h-40 mb-8 bg-white border-4 border-slate-50 p-3 rounded-[2.5rem] shadow-inner">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${window.location.origin}/#/village/${v.id}`} className="w-full h-full" alt="VQR" />
                 </div>
                 <h4 className="text-2xl font-black text-indigo-950 mb-1">{v.name}</h4>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{v.tehsil}</p>
              </div>
            ))}
         </div>
         <footer className="mt-20 pt-10 border-t border-slate-100 text-center opacity-30">
            <p className="text-xs font-black uppercase tracking-[1em]">यादव समाज वागड़ चौरासी • डिजिटल डायरेक्टरी</p>
         </footer>
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; }
          @page { margin: 1cm; size: A4; }
          .print-no-break { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default FullPrintView;
