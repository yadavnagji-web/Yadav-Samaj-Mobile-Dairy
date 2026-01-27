
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Fixed: Added missing Bulletin and Banner to imports
import { Village, Contact, DynamicField, Bulletin, Banner } from '../types';

interface VillageDetailsProps {
  villages: Village[];
  contacts: Contact[];
  fields: DynamicField[];
  // Fixed: Added missing bulletins and banners properties to the interface
  bulletins: Bulletin[];
  banners: Banner[];
  externalSearch?: string;
  setExternalSearch?: (val: string) => void;
}

const VillageDetails: React.FC<VillageDetailsProps> = ({ 
  villages, 
  contacts, 
  // Destructured additional props to align with the interface and usage in App.tsx
  fields,
  bulletins,
  banners,
  externalSearch,
  setExternalSearch 
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const village = villages.find(v => v.id === id && !v.isDeleted);
  const [searchTerm, setSearchTerm] = useState(externalSearch || '');

  useEffect(() => {
    if (externalSearch !== undefined) setSearchTerm(externalSearch);
  }, [externalSearch]);

  if (!village) return <div className="h-screen bg-transparent flex items-center justify-center font-heavy-custom text-slate-300">डेटा लोड हो रहा है...</div>;

  const filteredContacts = contacts
    .filter(c => c.villageId === id && !c.isDeleted && !c.isEmergency)
    .filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.mobile.includes(searchTerm) ||
      c.fatherName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'hi'));

  const handleShare = (contact: Contact) => {
    const shareText = `*यादव समाज वागड़ चौरासी*\n\n👤 नाम: ${contact.name}\n👴 पिता: ${contact.fatherName}\n📞 मोबाइल: ${contact.mobile}\n🏘️ गाँव: ${village.name}\n\n_डिजिटल ग्राम निर्देशिका_`;
    
    if (navigator.share) {
      navigator.share({ title: 'सदस्य विवरण', text: shareText }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Header */}
      <header className="premium-header px-4 py-10 rounded-b-[3.5rem] shadow-xl">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate('/')} className="bg-white/10 p-3 rounded-[1.25rem] border border-white/20 text-white transition-all active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center">
             <h2 className="text-2xl font-heavy-custom text-white">{village.name}</h2>
             <p className="text-[10px] font-light-custom text-blue-100 uppercase tracking-widest mt-1">{village.tehsil} - {village.district}</p>
          </div>
          <button onClick={() => window.print()} className="bg-white/10 p-3 rounded-[1.25rem] border border-white/20 text-white transition-all active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          </button>
        </div>

        {/* Fully Rounded Search Box */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-full flex items-center px-6 h-14">
           <svg className="w-5 h-5 mr-4 text-blue-100 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           <input 
             type="text" 
             placeholder="गाँव में सदस्य खोजें..." 
             className="bg-transparent outline-none w-full text-sm font-light-custom text-white placeholder-blue-200"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </header>

      {/* List */}
      <div className="flex-1 px-4 py-8 space-y-4 pb-24">
        <p className="text-[10px] font-light-custom text-slate-500 uppercase tracking-widest ml-4 mb-2">कुल सदस्य ({filteredContacts.length})</p>
        
        {filteredContacts.map((c, i) => (
          <div key={c.id} className="bg-white/80 backdrop-blur-md p-5 rounded-[2.25rem] border border-white/50 flex items-center shadow-sm">
            <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-50/50 text-indigo-700 flex items-center justify-center font-heavy-custom text-xl mr-5 border border-indigo-100 shadow-inner">
              {c.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h4 className="font-heavy-custom text-slate-800 text-base">{c.name}</h4>
              <p className="text-[10px] font-light-custom text-slate-400 mt-0.5">पिता: {c.fatherName}</p>
              <p className="text-indigo-600 font-heavy-custom text-sm mt-1">{c.mobile}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                // Fix: Changing 'contact' to 'c' to match the variable in the map function
                onClick={() => handleShare(c)}
                className="w-11 h-11 bg-white/40 rounded-[1.25rem] flex items-center justify-center text-slate-400 hover:text-green-500 transition-colors active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
              <a 
                href={`tel:${c.mobile}`}
                className="w-11 h-11 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 active:scale-90 overflow-hidden"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1.01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </a>
            </div>
          </div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="text-center py-24 opacity-30">
            <p className="text-slate-400 font-light-custom uppercase text-xs tracking-widest">कोई डेटा नहीं मिला</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VillageDetails;
