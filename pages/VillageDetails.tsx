
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Village, Contact, DynamicField, Bulletin, Banner } from '../types';
import { UI_STRINGS } from '../constants';

interface VillageDetailsProps {
  villages: Village[];
  contacts: Contact[];
  fields: DynamicField[];
  bulletins: Bulletin[];
  banners: Banner[];
  externalSearch?: string;
  setExternalSearch?: (val: string) => void;
}

const VillageDetails: React.FC<VillageDetailsProps> = ({ 
  villages, 
  contacts, 
  externalSearch 
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const village = villages.find(v => v.id === id && !v.isDeleted);
  const [searchTerm, setSearchTerm] = useState(externalSearch || '');

  const filteredContacts = useMemo(() => {
    return contacts
      .filter(c => c.villageId === id && !c.isDeleted)
      .filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.mobile.includes(searchTerm)
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'hi'));
  }, [contacts, id, searchTerm]);

  if (!village) return <div className="h-screen bg-transparent flex items-center justify-center font-bold text-slate-300">डेटा लोड हो रहा है...</div>;

  const handleShare = (contact: Contact) => {
    const shareText = `*यादव समाज वागड़ चौरासी*\n\n👤 नाम: ${contact.name}\n👴 पिता: ${contact.fatherName}\n📞 मोबाइल: ${contact.mobile}\n🏘️ गाँव: ${village.name}`;
    if (navigator.share) navigator.share({ title: 'सदस्य विवरण', text: shareText });
    else window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/#/village/${village.id}`)}&bgcolor=ffffff&color=000000&margin=20`;

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <header className="premium-header-gradient px-4 pt-8 pb-10 rounded-b-[3.5rem] shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between mb-8 relative z-10">
          <button onClick={() => navigate('/')} className="bg-white/10 p-3 rounded-[1.25rem] border border-white/20 text-white active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center flex-1">
             <h2 className="text-2xl font-bold text-white">{village.name}</h2>
             <p className="text-[10px] font-medium text-blue-100 uppercase tracking-widest mt-1">{village.tehsil} - {village.district}</p>
          </div>
          <button onClick={() => window.print()} className="bg-white/10 p-3 rounded-[1.25rem] border border-white/20 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center mb-8 relative z-10 animate-fade-in">
          <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl border-4 border-indigo-400/30">
            <img src={qrUrl} alt="Village QR" className="w-32 h-32 rounded-2xl" />
          </div>
          <p className="text-[9px] font-black text-white bg-indigo-900/40 px-5 py-1.5 rounded-full uppercase tracking-[0.3em] mt-4 border border-white/20 shadow-sm">गाँव की डिजिटल डायरी QR</p>
        </div>

        <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-full flex items-center px-6 h-14 relative z-10">
           <svg className="w-5 h-5 text-blue-100 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           <input 
             type="text" 
             placeholder="गाँव में सदस्य खोजें..." 
             className="bg-transparent outline-none w-full text-sm font-bold text-white placeholder-blue-200" 
             value={searchTerm} 
             onChange={(e) => setSearchTerm(e.target.value)} 
           />
        </div>
      </header>

      <div className="flex-1 px-4 py-8 space-y-4 pb-24">
        {filteredContacts.length > 0 ? filteredContacts.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-[2.25rem] border border-white flex items-center shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl mr-5 shrink-0">{c.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 text-base truncate">{c.name}</h4>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">पिता: {c.fatherName}</p>
              <p className="text-indigo-600 font-bold text-sm mt-1">{c.mobile}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleShare(c)} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 active:scale-90 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
              <a href={`tel:${c.mobile}`} className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 active:scale-90 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1.01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </a>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center opacity-30">
            <span className="text-6xl block mb-4">🔍</span>
            <p className="text-sm font-bold uppercase tracking-widest">कोई सदस्य नहीं मिला</p>
          </div>
        )}
      </div>

      <footer className="bg-white/50 backdrop-blur-md p-8 text-center border-t border-slate-100 print:hidden">
        <div className="flex flex-col items-center space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{UI_STRINGS.copyright}</p>
          <a href={`https://${UI_STRINGS.footerLink}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold text-xs hover:underline decoration-amber-400 decoration-2">
            {UI_STRINGS.footerLink}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default VillageDetails;
