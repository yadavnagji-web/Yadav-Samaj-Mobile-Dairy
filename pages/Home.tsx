
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

  const activeVillages = (villages || [])
    .filter(v => v && !v.isDeleted)
    .sort((a, b) => (a.name || '').localeCompare((b.name || ''), 'hi'));

  const filteredVillages = activeVillages.filter(v => 
    (v.name || '').includes(searchTerm) || (v.tehsil || '').includes(searchTerm) || (v.district || '').includes(searchTerm)
  );

  const cardGradients = [
    'from-indigo-600 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-emerald-600 to-teal-700',
    'from-rose-500 to-pink-600',
    'from-violet-600 to-purple-700',
    'from-sky-500 to-cyan-600',
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Registration CTA - Sleek & Modern */}
      <div className="relative bg-white p-5 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          </div>
          <div>
            <p className="font-black text-slate-800 text-base">अपना नंबर जोड़ें</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">समाज की डिजिटल निर्देशिका</p>
          </div>
        </div>
        <Link to="/register" className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center group-hover:scale-105">
          रजिस्टर करें ↗
        </Link>
      </div>

      {/* Hero Header Section - Attractive and Compact */}
      <div className="text-center bg-white pt-10 pb-12 px-8 rounded-[3.5rem] shadow-2xl border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-50/50 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-full overflow-hidden flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-slate-100 p-1 group hover:scale-110 transition-transform duration-500">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-indigo-600 font-black text-[11px] uppercase tracking-[0.5em] mb-2">{UI_STRINGS.appName}</h2>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight px-4 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700">
              {UI_STRINGS.subName} मोबाइल डायरी
            </h1>
            <div className="flex items-center justify-center space-x-2 mt-4 opacity-40">
              <div className="h-[1px] w-6 bg-slate-300"></div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 italic">समाज सेवा • संगठन • शक्ति</p>
              <div className="h-[1px] w-6 bg-slate-300"></div>
            </div>
          </div>

          <div className="relative max-w-lg mx-auto mt-10 px-2">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text"
              placeholder={UI_STRINGS.searchPlaceholder}
              className="w-full pl-14 pr-8 py-4.5 rounded-[2rem] border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold shadow-lg bg-slate-50/50 text-base placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (setExternalSearch) setExternalSearch(e.target.value);
              }}
            />
          </div>

          <div className="mt-8 flex flex-col items-center">
            <VoiceSearch onResult={(p, o) => setSearchTerm(p?.village || o)} />
            <div className="mt-6 flex items-center space-x-2 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50/80 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
              <span>AI सहायक सक्रिय है</span>
            </div>
          </div>
        </div>
      </div>

      {/* Villages List Section */}
      <div className="px-1">
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center space-x-3">
             <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
             <h2 className="text-xl font-black text-slate-900 tracking-tight">{UI_STRINGS.villageList}</h2>
          </div>
          <span className="text-[9px] font-black text-slate-400 bg-white border border-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
            कुल: {activeVillages.length} गाँव
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredVillages.map((village, idx) => (
            <Link 
              key={village.id}
              to={`/village/${village.id}`}
              className="group relative bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} opacity-[0.03] rounded-bl-[4rem] group-hover:opacity-[0.08] transition-opacity`}></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-indigo-700 transition-colors">
                    {village.name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    तहसील: {village.tehsil}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} shadow-lg group-hover:rotate-6 transition-transform`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          ))}
          
          {filteredVillages.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-sm">कोई गाँव नहीं मिला।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
