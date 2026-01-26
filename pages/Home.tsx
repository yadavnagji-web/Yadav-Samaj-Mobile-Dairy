
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Village, Banner } from '../types';
import VoiceSearch from '../components/VoiceSearch';
import { UI_STRINGS } from '../constants';

interface HomeProps {
  villages: Village[];
  banners: Banner[];
  externalSearch?: string;
  setExternalSearch?: (val: string) => void;
  logoUrl: string;
}

const Home: React.FC<HomeProps> = ({ villages, banners, externalSearch, setExternalSearch, logoUrl }) => {
  const [searchTerm, setSearchTerm] = useState(externalSearch || '');
  useEffect(() => {
    if (externalSearch !== undefined) setSearchTerm(externalSearch);
  }, [externalSearch]);

  const activeVillages = villages
    .filter(v => !v.isDeleted)
    .sort((a, b) => a.name.localeCompare(b.name, 'hi'));

  const filteredVillages = activeVillages.filter(v => 
    v.name.includes(searchTerm) || v.tehsil.includes(searchTerm) || v.district.includes(searchTerm)
  );

  const cardGradients = [
    'from-blue-500/10 to-indigo-500/10',
    'from-amber-500/10 to-orange-500/10',
    'from-emerald-500/10 to-teal-500/10',
    'from-rose-500/10 to-pink-500/10',
    'from-violet-500/10 to-purple-500/10',
    'from-sky-500/10 to-cyan-500/10',
  ];

  return (
    <div className="space-y-8">
      {/* Registration Banner */}
      <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
         <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-md">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <div>
               <p className="font-black text-indigo-900">आपका नंबर अभी तक नहीं जुड़ा है?</p>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">अभी जोड़ें और डिजिटल पहचान बनाएं</p>
            </div>
         </div>
         <Link to="/register" className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">नंबर जोड़ें ↗</Link>
      </div>

      <div className="text-center bg-white/70 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -ml-16 -mt-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full -mr-20 -mb-20"></div>
        
        <div className="relative z-10">
          <div className="w-32 h-32 bg-white rounded-full overflow-hidden flex items-center justify-center mx-auto mb-8 shadow-2xl border-4 border-indigo-600 p-1">
            <img src={logoUrl} alt="Brand Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black text-indigo-950 tracking-tight leading-none drop-shadow-sm">
            {UI_STRINGS.appName}
          </h1>
          <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.3em] mt-3">
            {UI_STRINGS.tagline}
          </p>

          <div className="relative max-w-md mx-auto mt-10">
            <input 
              type="text"
              placeholder={UI_STRINGS.searchPlaceholder}
              className="w-full px-8 py-5 pr-14 rounded-[2rem] border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold shadow-lg bg-white/80"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (setExternalSearch) setExternalSearch(e.target.value);
              }}
            />
            <div className="absolute right-5 top-5 text-indigo-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="mt-10">
            <VoiceSearch onResult={(p, o) => setSearchTerm(p?.village || o)} />
            <p className="text-[10px] font-black text-indigo-500 bg-indigo-50 inline-block px-4 py-1.5 rounded-full uppercase tracking-widest mt-6 shadow-sm border border-indigo-100">
              AI वॉइस खोज प्रणाली सक्रिय है
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-2xl font-black text-indigo-900 flex items-center">
            <span className="w-3 h-8 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full mr-3 shadow-md"></span>
            {UI_STRINGS.villageList}
          </h2>
          <span className="text-[10px] font-black text-white bg-indigo-600 px-4 py-1.5 rounded-full uppercase shadow-lg border-2 border-white">
            {activeVillages.length} गाँव
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredVillages.map((village, idx) => (
            <Link 
              key={village.id}
              to={`/village/${village.id}`}
              className={`group p-8 rounded-[2.5rem] border border-white/50 shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-all flex items-center justify-between bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} relative overflow-hidden backdrop-blur-md`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-800 transition-colors tracking-tight">
                  {village.name}
                </h3>
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest bg-white/40 px-3 py-0.5 rounded-full inline-block">
                  {village.tehsil}
                </p>
              </div>
              <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl border-2 border-transparent group-hover:border-white">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
          {filteredVillages.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-indigo-200">
              <p className="text-indigo-400 font-black text-lg">क्षमा करें, कोई गाँव नहीं मिला।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
