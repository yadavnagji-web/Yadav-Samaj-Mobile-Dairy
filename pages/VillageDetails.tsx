
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Village, Contact, Bulletin, Banner, DynamicField } from '../types';
import { speakText } from '../services/geminiService';

interface VillageDetailsProps {
  villages: Village[];
  contacts: Contact[];
  bulletins: Bulletin[];
  banners: Banner[];
  fields: DynamicField[];
  externalSearch?: string;
  setExternalSearch?: (val: string) => void;
}

const VillageDetails: React.FC<VillageDetailsProps> = ({ villages, contacts, bulletins, banners, fields, externalSearch, setExternalSearch }) => {
  const { id } = useParams<{ id: string }>();
  const village = villages.find(v => v.id === id && !v.isDeleted);
  const [searchTerm, setSearchTerm] = useState(externalSearch || '');

  useEffect(() => {
    if (externalSearch !== undefined) setSearchTerm(externalSearch);
  }, [externalSearch]);

  if (!village) return <div className="text-center py-20 text-slate-400 font-black">गाँव नहीं मिला या लोड हो रहा है...</div>;

  const villageContacts = contacts.filter(c => c.villageId === id && !c.isDeleted);
  const emergencyContacts = villageContacts.filter(c => c.isEmergency);
  const regularContacts = villageContacts.filter(c => !c.isEmergency);
  
  const filteredContacts = regularContacts.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.profession || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.mobile || '').includes(searchTerm) ||
    (c.fatherName && c.fatherName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Village Header */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <Link to="/" className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-indigo-900 tracking-tight leading-none">{village.name}</h1>
              <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">{village.tehsil}, {village.district}</p>
            </div>
          </div>
          <div className="p-2 bg-slate-50 rounded-3xl border border-slate-100 hidden sm:block">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=village_${village.id}`} className="w-16 h-16 rounded-2xl" alt="QR" />
          </div>
        </div>

        <div className="relative">
          <input 
            type="text"
            placeholder="नाम, पिता का नाम या मोबाइल से खोजें..."
            className="w-full px-8 py-5 pl-14 rounded-[2rem] border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold shadow-inner"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (setExternalSearch) setExternalSearch(e.target.value);
            }}
          />
          <div className="absolute left-5 top-5 text-indigo-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      {/* SOS / Emergency Section */}
      {emergencyContacts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-8 shadow-lg shadow-red-100/20">
          <h3 className="text-red-700 font-black mb-6 flex items-center uppercase tracking-widest text-[10px]">
            <span className="mr-3 animate-pulse bg-red-200 p-2 rounded-full">🆘</span> आवश्यक सेवा एवं इमरजेंसी संपर्क
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emergencyContacts.map(c => (
              <ContactCard key={c.id} contact={c} isEmergency={true} fields={fields} villageName={village.name} />
            ))}
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-2xl font-black text-indigo-900">ग्राम निर्देशिका</h3>
          <span className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-full font-black shadow-lg">
            {filteredContacts.length} संपर्क
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {filteredContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} fields={fields} villageName={village.name} />
          ))}
          {filteredContacts.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-200 shadow-inner">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p className="text-slate-400 font-black">कोई संपर्क नहीं मिला।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactCard: React.FC<{ contact: Contact, isEmergency?: boolean, fields: DynamicField[], villageName: string }> = ({ contact, isEmergency, fields, villageName }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const share = () => {
    const text = `*भीम डायरी*\nनाम: ${contact.name}\nगाँव: ${villageName}\nमोबाइल: ${contact.mobile}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    const textToSpeak = `नाम: ${contact.name}, ${contact.fatherName ? `पिता: ${contact.fatherName},` : ''} पेशा: ${contact.profession}`;
    await speakText(textToSpeak);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  const dynamicValues = contact.dynamicValues || {};

  return (
    <div className={`bg-white p-6 rounded-[2.5rem] shadow-sm border-2 transition-all hover:shadow-md ${isEmergency ? 'border-red-100 hover:border-red-200' : 'border-slate-50 hover:border-indigo-100'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${isEmergency ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-300'}`}>
            {(contact.name || 'B').charAt(0)}
          </div>
          <div>
            <h4 className="font-black text-slate-800 text-xl tracking-tight leading-tight">{contact.name}</h4>
            <div className="flex flex-col mt-0.5">
               {contact.fatherName && (
                 <p className="text-[11px] font-bold text-slate-400">पिता: {contact.fatherName}</p>
               )}
               <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 bg-opacity-10 px-3 py-0.5 rounded-full inline-block w-fit ${isEmergency ? 'bg-red-500 text-red-600' : 'bg-indigo-500 text-indigo-600'}`}>
                {contact.profession}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* TTS Button */}
          <button 
            onClick={handleSpeak}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isSpeaking ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            title="सुनें"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          
          <a href={`tel:${contact.mobile}`} title="कॉल करें" className={`w-11 h-11 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all ${isEmergency ? 'bg-red-600 shadow-red-100' : 'bg-green-500 shadow-green-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
          
          <button onClick={share} title="व्हाट्सएप शेयर" className="w-11 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 active:scale-90 transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03.3-.134.149-.148.149-.413.149h-.147c-.133 0-.265-.018-.395-.053" />
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.408 2.445 1.103 3.407l-.722 2.637 2.7-.71c.917.584 2.003.931 3.17.931 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767zm3.844 8.161c-.134.375-.667.688-1.071.742-.393.054-.875.054-1.428-.147-2.143-.768-3.527-2.929-3.634-3.071-.107-.143-.875-1.161-.875-2.214 0-1.054.554-1.571.75-1.786.196-.214.429-.268.571-.268.143 0 .286.018.411.018.125 0 .286-.054.446.339.161.393.554 1.357.607 1.464.054.107.089.232.018.375-.071.143-.107.232-.214.357-.107.125-.232.286-.339.375-.125.107-.25.232-.107.482.143.25.625 1.036 1.339 1.67.929.821 1.714 1.071 1.964 1.214.25.143.393.125.536-.036.143-.161.625-.732.786-.982.161-.25.321-.214.536-.143.214.071 1.357.643 1.589.75.232.107.393.161.446.25.054.089.054.518-.08.893z" />
            </svg>
          </button>
        </div>
      </div>

      {Object.entries(dynamicValues).length > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-50 grid grid-cols-2 gap-4">
           {Object.entries(dynamicValues).map(([fieldId, val]) => {
              const field = fields.find(f => f.id === fieldId);
              if (!field || !val) return null;
              return (
                <div key={fieldId} className="space-y-0.5">
                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{field.name}</span>
                   <p className="text-xs font-bold text-slate-600">{val}</p>
                </div>
              );
           })}
        </div>
      )}
    </div>
  );
};

export default VillageDetails;
