
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Village, Contact, AppSettings } from '../types';
import { UI_STRINGS, DAILY_THOUGHTS } from '../constants';
import MobileDrawer from '../components/MobileDrawer';

interface HomeProps {
  villages: Village[];
  contacts: Contact[];
  settings: AppSettings;
  user: any;
  onLogout: any;
}

const Home: React.FC<HomeProps> = ({ villages, contacts, settings, user, onLogout }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    const shareText = `*${UI_STRINGS.appName}*\n\n👤 नाम: ${contact.name}\n👴 पिता: ${contact.fatherName}\n📞 मोबाइल: ${contact.mobile}\n🏘️ गाँव: ${villageName}`;
    if (navigator.share) {
      navigator.share({ title: 'सदस्य विवरण', text: shareText }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent print:bg-white">
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} user={user} onLogout={onLogout} villages={villages} contacts={contacts} />

      <header className="premium-header sticky top-0 z-50 pt-6 px-4 pb-10 print:hidden">
        <div className="flex items-start justify-between mb-6 gap-3">
          <div className="flex items-start space-x-3">
             <button onClick={() => setIsDrawerOpen(true)} className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white active:scale-90 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <div>
               <h1 className="text-sm font-heavy-custom text-white tracking-tight leading-tight uppercase max-w-[180px]">
                 {UI_STRINGS.shortName}
               </h1>
               <p className="text-[8px] text-indigo-100 font-light-custom uppercase tracking-widest mt-1 opacity-80 border-l-2 border-amber-400 pl-2">
                 {UI_STRINGS.tagline}
               </p>
             </div>
          </div>
          <Link to="/login" className="w-10 h-10 bg-white rounded-xl border border-white/40 text-indigo-600 shadow-xl flex items-center justify-center shrink-0 active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </Link>
        </div>

        <div className="space-y-4">
          <div className="bg-white/95 shadow-xl h-12 rounded-full flex items-center px-5">
            <svg className="w-4 h-4 text-indigo-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="नाम या मोबाइल से खोजें..." className="flex-1 outline-none text-xs font-light-custom text-slate-700 bg-transparent placeholder-slate-400" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="relative">
            <select className="w-full bg-white/20 backdrop-blur-lg border border-white/30 p-4 rounded-full text-white font-heavy-custom text-xs outline-none appearance-none px-6" value={selectedVillageId} onChange={(e) => setSelectedVillageId(e.target.value)}>
              <option value="" className="text-slate-800">--- अपना गाँव चुनें ---</option>
              {villages.filter(v => !v.isDeleted).sort((a,b)=>a.name.localeCompare(b.name,'hi')).map(v => (
                <option key={v.id} value={v.id} className="text-slate-800">{v.name}</option>
              ))}
            </select>
            <div className="absolute right-6 top-4 pointer-events-none text-white/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24 print:hidden">
        {(selectedVillageId || search) ? (
          <div className="space-y-3">
            <h2 className="text-[9px] font-light-custom text-indigo-900/40 uppercase tracking-[0.3em] px-2 mb-2">खोज परिणाम ({filteredList.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map((c) => (
                <div key={c.id} className="item-card flex items-center p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-heavy-custom text-lg mr-4 border border-indigo-50">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heavy-custom text-indigo-950 text-sm leading-tight">{c.name}</h4>
                    <p className="text-[9px] font-light-custom text-slate-400 uppercase mt-0.5">पिता: {c.fatherName}</p>
                    <p className="text-purple-600 font-heavy-custom text-xs mt-1">{c.mobile}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleShare(c)} className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-green-500 active:scale-90">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </button>
                    <a href={`tel:${c.mobile}`} className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white active:scale-90 shadow-lg p-2">
                      <svg className="w-full h-full shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1.01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center space-y-6">
             <div className="flex flex-col items-center justify-center mx-auto space-y-2">
                <span className="text-slate-200 text-6xl opacity-20">🏘️</span>
             </div>
             <p className="text-[10px] font-light-custom text-slate-500 uppercase tracking-widest max-w-[200px] mx-auto leading-loose italic">
               यादव समाज की डिजिटल डायरी में आपका स्वागत है। अपना गाँव चुनें।
             </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
