
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Village, Contact, AppSettings } from '../types';
import { UI_STRINGS, AMBEDKAR_THOUGHTS } from '../constants';
import { getHindiDateInfo } from '../utils/hindiCalendar';
import MobileDrawer from '../components/MobileDrawer';

interface HomeProps {
  villages: Village[];
  contacts: Contact[];
  settings: AppSettings;
  user: any;
  onLogout: any;
}

const Home: React.FC<HomeProps> = ({ villages = [], contacts = [], settings, user, onLogout }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [panchangInfo, setPanchangInfo] = useState<any>(null);
  const [thought, setThought] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    setPanchangInfo(getHindiDateInfo());
    const day = new Date().getDate();
    if (AMBEDKAR_THOUGHTS && AMBEDKAR_THOUGHTS.length > 0) {
      setThought(AMBEDKAR_THOUGHTS[day % AMBEDKAR_THOUGHTS.length]);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (isStandalone) {
        alert("यह ऐप पहले से ही आपके मोबाइल में इंस्टॉल है!");
      } else {
        alert("कृपया ब्राउज़र मेनू में 'Add to Home Screen' या 'होम स्क्रीन पर जोड़ें' विकल्प चुनें।");
      }
    }
  };

  const handleShareApp = () => {
    const shareUrl = window.location.origin + window.location.pathname + window.location.search;
    const shareText = `*${UI_STRINGS.appName}*\n\nयादव समाज की अपनी डिजिटल डायरी अपने मोबाइल में इंस्टॉल करें और समाज से जुड़ें।\n\nयहाँ क्लिक करें: ${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: UI_STRINGS.appName,
        text: shareText,
        url: shareUrl
      }).catch(() => {
        // Fallback to WhatsApp
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const filteredList = useMemo(() => {
    if (!Array.isArray(contacts)) return [];
    let list = contacts.filter(c => !c.isDeleted);
    if (selectedVillageId) list = list.filter(c => c.villageId === selectedVillageId);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => 
        (c.name && c.name.toLowerCase().includes(s)) || 
        (c.mobile && c.mobile.includes(s)) || 
        (c.fatherName && c.fatherName.toLowerCase().includes(s))
      );
    }
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'hi'));
  }, [contacts, search, selectedVillageId]);

  const handleShareContact = (contact: Contact) => {
    const villageName = villages.find(v => v.id === contact.villageId)?.name || 'अज्ञात';
    const shareText = `*${UI_STRINGS.appName}*\n\n👤 नाम: ${contact.name}\n📞 मोबाइल: ${contact.mobile}\n🏘️ गाँव: ${villageName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const showResults = !!(selectedVillageId || search);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative overflow-hidden pb-24">
      <MobileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        user={user} 
        onLogout={onLogout} 
        villages={villages} 
        contacts={contacts} 
      />

      {installSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-sm">
          <div className="bg-emerald-600 text-white p-5 rounded-[2rem] shadow-2xl flex items-center space-x-4 border-2 border-white animate-bounce">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">✅</div>
            <p className="text-xs font-bold leading-tight">बधाई हो! ऐप सफलतापूर्वक इंस्टॉल हो गया है।</p>
          </div>
        </div>
      )}

      <header className="premium-header-gradient pt-8 pb-12 px-6 print:hidden h-[180px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <button onClick={() => setIsDrawerOpen(true)} className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">{UI_STRINGS.appName}</h1>
            <p className="text-[9px] text-indigo-100 font-medium uppercase tracking-[0.2em] mt-1 opacity-90">{UI_STRINGS.tagline}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/help')} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white mr-1">
              <span className="text-lg">💡</span>
            </button>
            <button onClick={handleShareApp} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
          </div>
        </div>

        <div className="mt-8 -mb-16 relative z-[60]">
          <div className="search-pill bg-white h-14 flex items-center px-6 transition-all focus-within:ring-4 ring-indigo-500/10">
            <svg className="w-5 h-5 text-indigo-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="नाम या मोबाइल से खोजें..." 
              className="flex-1 outline-none text-sm font-semibold text-gray-800 bg-transparent placeholder-gray-400" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 mt-12">
        <div className="mb-6 flex space-x-2">
          <div className="village-selector relative flex-1">
             <select 
               className="w-full bg-white p-4 rounded-2xl text-gray-700 font-bold text-sm outline-none appearance-none cursor-pointer pr-10 border border-gray-100 shadow-sm" 
               value={selectedVillageId} 
               onChange={(e) => setSelectedVillageId(e.target.value)}
             >
               <option value="">— गाँव चुनें —</option>
               {villages && villages.filter(v => !v.isDeleted).sort((a,b)=>a.name.localeCompare(b.name,'hi')).map(v => (
                 <option key={v.id} value={v.id}>{v.name}</option>
               ))}
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
             </div>
          </div>
          <button 
            onClick={handleInstallApp} 
            className="px-5 bg-black text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg active:scale-95 transition-all"
          >
            Install
          </button>
        </div>

        {!showResults && (
          <div className="mb-8 animate-fade-in px-1 space-y-4">
            <div className="bg-white/80 backdrop-blur-lg border border-white p-6 rounded-[2.25rem] shadow-sm text-center relative overflow-hidden">
               <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-2">आज का विचार</p>
               <p className="text-sm font-bold text-gray-800 leading-relaxed italic px-4">"{thought}"</p>
               <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-3">— डॉ. बी.आर. अंबेडकर</p>
            </div>

            {panchangInfo && (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="flex-1 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-center">
                    <span className="text-[7px] font-black text-gray-300 uppercase tracking-widest block mb-1">दिनांक</span>
                    <span className="text-[11px] font-bold text-gray-800">{panchangInfo.dinank}</span>
                  </div>
                  <div className="flex-1 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-center">
                    <span className="text-[7px] font-black text-gray-300 uppercase tracking-widest block mb-1">वार</span>
                    <span className="text-[11px] font-bold text-gray-800">{panchangInfo.vaar}</span>
                  </div>
                </div>
                {/* Restored 3-column Panchang Info */}
                <div className="grid grid-cols-3 gap-2">
                   <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-center">
                      <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest mb-1">माह</p>
                      <p className="text-[10px] font-bold text-gray-800">{panchangInfo.mahina}</p>
                   </div>
                   <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-center">
                      <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest mb-1">पक्ष</p>
                      <p className="text-[10px] font-bold text-gray-800">{panchangInfo.paksh}</p>
                   </div>
                   <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-center">
                      <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest mb-1">तिथि</p>
                      <p className="text-[10px] font-bold text-gray-800">{panchangInfo.tithi}</p>
                   </div>
                </div>
              </div>
            )}

            {settings.adminAlertMessage && (
              <div className="bg-indigo-600 p-6 rounded-[2.25rem] shadow-xl text-white relative overflow-hidden">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">📢</span>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-80">विशेष सूचना</p>
                </div>
                <p className="text-sm font-bold leading-relaxed">{settings.adminAlertMessage}</p>
              </div>
            )}
          </div>
        )}

        {showResults ? (
          <div className="space-y-4 animate-fade-in">
            {filteredList.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-[2.25rem] border border-gray-50 flex items-center shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl mr-5 shrink-0">
                  {c.name ? c.name.charAt(0) : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-base truncate">{c.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">पिता: {c.fatherName}</p>
                  <p className="text-indigo-600 font-bold text-sm mt-1">{c.mobile}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleShareContact(c)} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 active:scale-90 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  </button>
                  <a href={`tel:${c.mobile}`} className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 active:scale-90 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1.01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
             <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center mb-6 border border-indigo-50">
                <span className="text-5xl">📖</span>
             </div>
             <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">डिजिटल मोबाइल डायरी</h2>
             <p className="text-[9px] font-bold text-gray-400 mt-2 max-w-[200px] mx-auto uppercase tracking-widest text-center">गाँव चुनें या खोजें</p>
          </div>
        )}
      </main>

      <footer className="bg-white/50 backdrop-blur-md p-10 text-center border-t border-slate-100 mt-auto">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">{UI_STRINGS.copyright}</p>
        <div className="flex justify-center space-x-2">
          <a href={`https://${UI_STRINGS.footerLink}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full">
            {UI_STRINGS.footerLink}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
