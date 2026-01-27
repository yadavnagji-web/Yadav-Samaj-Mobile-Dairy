
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Village, Contact, AppSettings } from '../types';
import { UI_STRINGS, DAILY_THOUGHTS } from '../constants';
import MobileDrawer from '../components/MobileDrawer';

interface HomeProps {
  villages: Village[];
  contacts: Contact[];
  settings: AppSettings;
  logoUrl: string;
  user: any;
  onLogout: any;
}

const Home: React.FC<HomeProps> = ({ villages, contacts, settings, logoUrl, user, onLogout }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Logic for Thought of the Day - changes based on date
  const todayIndex = new Date().getDate() % DAILY_THOUGHTS.length;
  const thoughtOfTheDay = DAILY_THOUGHTS[todayIndex];

  const filteredList = useMemo(() => {
    let list = (contacts || []).filter(c => !c.isDeleted);
    if (selectedVillageId) list = list.filter(c => c.villageId === selectedVillageId);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(s) || 
        c.mobile.includes(s) || 
        c.fatherName?.toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, 'hi'));
  }, [contacts, search, selectedVillageId]);

  const handleShare = (contact: Contact) => {
    const villageName = villages.find(v => v.id === contact.villageId)?.name || 'अज्ञात';
    const shareText = `*${UI_STRINGS.appName}*\n\n👤 नाम: ${contact.name}\n👴 पिता: ${contact.fatherName}\n📞 मोबाइल: ${contact.mobile}\n🏘️ गाँव: ${villageName}\n\n_डिजिटल ग्राम निर्देशिका एवं सामाजिक डायरी_`;
    
    if (navigator.share) {
      navigator.share({
        title: 'सदस्य विवरण',
        text: shareText,
      }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent print:bg-white">
      <MobileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        user={user} 
        onLogout={onLogout} 
        logoUrl={logoUrl} 
        villages={villages}
        contacts={contacts}
      />

      <header className="premium-header sticky top-0 z-50 pt-8 px-6 pb-12 print:hidden">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-start space-x-4">
             <button onClick={() => setIsDrawerOpen(true)} className="w-12 h-12 rounded-[1.25rem] bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white transition-all active:scale-90 hover:bg-white/30 shrink-0 mt-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <div>
               <h1 className="text-base font-black text-white tracking-tight leading-tight uppercase max-w-[200px] sm:max-w-none">
                 {UI_STRINGS.shortName}
               </h1>
               <p className="text-[9px] text-indigo-100 font-bold uppercase tracking-[0.2em] mt-2 opacity-90 border-l-2 border-amber-400 pl-2">
                 {UI_STRINGS.tagline}
               </p>
             </div>
          </div>
          <Link to="/login" className="w-12 h-12 bg-white rounded-[1.25rem] border border-white/40 text-indigo-600 shadow-2xl flex items-center justify-center shrink-0 active:scale-90 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </Link>
        </div>

        <div className="space-y-5">
          {/* Fully Rounded Search Box */}
          <div className="bg-white/95 border-none shadow-2xl h-14 rounded-full flex items-center px-6 overflow-hidden">
            <svg className="w-5 h-5 text-indigo-400 mr-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="नाम या मोबाइल से खोजें..." 
              className="flex-1 outline-none text-sm font-bold text-slate-700 bg-transparent placeholder-slate-400" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          <div className="relative group">
            <select className="w-full bg-white/20 backdrop-blur-lg border border-white/30 p-5 rounded-full text-white font-black text-sm outline-none appearance-none cursor-pointer focus:bg-white/30 transition-all px-8" value={selectedVillageId} onChange={(e) => setSelectedVillageId(e.target.value)}>
              <option value="" className="text-slate-800">--- अपना गाँव चुनें ---</option>
              {villages.filter(v => !v.isDeleted).sort((a,b)=>a.name.localeCompare(b.name,'hi')).map(v => (
                <option key={v.id} value={v.id} className="text-slate-800">{v.name}</option>
              ))}
            </select>
            <div className="absolute right-8 top-5 pointer-events-none text-white/70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 pb-28 print:hidden">
        {/* Thought of the Day Card - Only on main view */}
        {!selectedVillageId && !search && (
          <div className="mb-10 animate-slide-up">
            <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 rounded-[3.5rem] border border-amber-100 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-400 text-9xl leading-none">“</div>
               <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] mb-4 flex items-center">
                 <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                 आज का विचार
               </p>
               <p className="text-lg font-black text-amber-900 leading-tight italic relative z-10">
                 {thoughtOfTheDay}
               </p>
               <p className="text-[9px] font-bold text-amber-400 mt-6 uppercase tracking-widest text-right">— बाबासाहेब अंबेडकर</p>
            </div>
          </div>
        )}

        {(selectedVillageId || search) ? (
          <div className="space-y-5">
            <div className="flex justify-between items-center px-3 mb-4">
               <div className="flex items-center space-x-3">
                 {selectedVillageId && (
                   <button onClick={() => setSelectedVillageId('')} className="bg-white p-2.5 rounded-xl text-indigo-600 shadow-sm border border-slate-100 active:scale-90">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                   </button>
                 )}
                 <h2 className="text-[10px] font-black text-indigo-900/50 uppercase tracking-[0.3em]">
                   {selectedVillageId ? `${villages.find(v=>v.id===selectedVillageId)?.name} लिस्ट` : 'खोज परिणाम'} ({filteredList.length})
                 </h2>
               </div>
               {selectedVillageId && (
                 <button onClick={() => window.print()} className="text-[10px] font-black text-white bg-indigo-600 px-5 py-2.5 rounded-full shadow-lg shadow-indigo-100 flex items-center space-x-2 active:scale-95 transition-all">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                   <span>प्रिंट PDF</span>
                 </button>
               )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((c) => (
                <div key={c.id} className="item-card flex items-center group animate-slide-up">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 flex items-center justify-center font-black text-xl mr-5 border border-indigo-100 shadow-inner">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-indigo-950 text-base leading-tight">{c.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">पिता: {c.fatherName}</p>
                    <p className="text-purple-600 font-black text-sm mt-1 tracking-tight">{c.mobile}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleShare(c)}
                      className="w-11 h-11 bg-slate-50 rounded-[1.25rem] flex items-center justify-center text-slate-400 hover:text-green-500 hover:bg-green-50 transition-all active:scale-90"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </button>
                    <a 
                      href={`tel:${c.mobile}`}
                      className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200 active:scale-90 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1.01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-24 text-center space-y-8 animate-fade-in">
             <div className="relative inline-block">
               <div className="absolute inset-0 bg-indigo-400 blur-[80px] opacity-20 animate-pulse"></div>
               <div className="relative w-32 h-32 bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl flex items-center justify-center mx-auto text-indigo-500 border border-white p-4">
                 <img src={logoUrl} className="w-full h-full object-contain" alt="Ambdekar Logo" />
               </div>
             </div>
             <div>
               <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">{UI_STRINGS.shortName}</p>
               <p className="text-xs font-bold text-slate-500 max-w-[260px] mx-auto leading-loose bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 italic">
                 वागड़ चौरासी यादव समाज की डिजिटल डायरी में आपका स्वागत है। अपना गाँव चुनें।
               </p>
             </div>
          </div>
        )}
      </main>

      <footer className="pb-16 text-center print:hidden opacity-40">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">{UI_STRINGS.copyright}</p>
      </footer>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Home;
