
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Village, Contact, Bulletin, Banner, DynamicField } from '../types';

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

  if (!village) return <div className="text-center py-20 text-slate-400 font-black">गाँव नहीं मिला।</div>;

  const villageContacts = contacts.filter(c => c.villageId === id && c.isActive && !c.isDeleted);
  const emergencyContacts = villageContacts.filter(c => c.isEmergency);
  const regularContacts = villageContacts.filter(c => !c.isEmergency);
  
  const villageBulletins = bulletins.filter(b => b.villageId === id && new Date(b.expiryDate) > new Date());
  
  const filteredContacts = regularContacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Village Header */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-indigo-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-indigo-900 tracking-tight leading-none">{village.name}</h1>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{village.tehsil}, {village.district}</p>
            </div>
          </div>
          <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=village_${village.id}`} className="w-16 h-16 rounded-xl" alt="QR" />
          </div>
        </div>

        <div className="relative">
          <input 
            type="text"
            placeholder="मोबाइल नंबर या नाम से खोजें..."
            className="w-full px-6 py-4 pl-12 rounded-[1.5rem] border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (setExternalSearch) setExternalSearch(e.target.value);
            }}
          />
          <div className="absolute left-4 top-4.5 text-indigo-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      {/* SOS / Emergency Section - RESTORED */}
      {emergencyContacts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-6 shadow-lg shadow-red-50">
          <h3 className="text-red-700 font-black mb-4 flex items-center uppercase tracking-widest text-xs">
            <span className="mr-2 animate-pulse">🆘</span> आवश्यक सेवा एवं इमरजेंसी संपर्क
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emergencyContacts.map(c => (
              <ContactCard key={c.id} contact={c} isEmergency={true} fields={fields} />
            ))}
          </div>
        </div>
      )}

      {/* Bulletin Board */}
      {villageBulletins.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-100 rounded-[2rem] p-6 shadow-lg shadow-amber-50">
          <h3 className="text-amber-800 font-black mb-4 flex items-center uppercase tracking-widest text-xs">
            <span className="mr-2">📢</span> गाँव का सूचना पट्ट (Bulletin)
          </h3>
          <div className="space-y-3">
            {villageBulletins.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-black text-slate-800">{b.title}</h4>
                   <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">{b.date}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{b.description}</p>
                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                  <span>स्थान: {b.location}</span>
                  <span>संपर्क: {b.contactPerson}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-indigo-900 flex items-center px-2">
           ग्राम निर्देशिका 
           <span className="ml-3 text-xs bg-indigo-100 px-3 py-1 rounded-full text-indigo-600 font-black">{filteredContacts.length}</span>
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {filteredContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} fields={fields} />
          ))}
          {filteredContacts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">कोई संपर्क नहीं मिला।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactCard: React.FC<{ contact: Contact, isEmergency?: boolean, fields: DynamicField[] }> = ({ contact, isEmergency, fields }) => {
  const share = () => {
    let dynamicText = "";
    Object.entries(contact.dynamicValues).forEach(([fieldId, value]) => {
      const field = fields.find(f => f.id === fieldId);
      if (field && value) dynamicText += `\n${field.name}: ${value}`;
    });
    const text = `*भीम डायरी*\nनाम: ${contact.name}\nमोबाइल: ${contact.mobile}\nपेशा: ${contact.profession}${dynamicText}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className={`bg-white p-5 rounded-3xl shadow-sm border-2 transition-all ${isEmergency ? 'border-red-100' : 'border-slate-50 hover:border-indigo-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isEmergency ? 'bg-red-100 text-red-500' : 'bg-indigo-50 text-indigo-300'}`}>
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
          </div>
          <div>
            <h4 className="font-black text-slate-800 text-lg leading-tight">{contact.name}</h4>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isEmergency ? 'text-red-600' : 'text-indigo-600'}`}>{contact.profession}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <a href={`tel:${contact.mobile}`} className={`w-10 h-10 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${isEmergency ? 'bg-red-600' : 'bg-green-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28M3 5a2 2 0 012-2h3.28" /></svg>
          </a>
          <button onClick={share} className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03.3-.134.149-.148.149-.413.149h-.147c-.133 0-.265-.018-.395-.053" /></svg>
          </button>
        </div>
      </div>

      {/* Dynamic Fields Display */}
      {Object.entries(contact.dynamicValues).length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-2 gap-y-2">
           {Object.entries(contact.dynamicValues).map(([fieldId, val]) => {
              const field = fields.find(f => f.id === fieldId);
              if (!field || !val) return null;
              return (
                <div key={fieldId} className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{field.name}</span>
                   <span className="text-xs font-bold text-slate-700">{val}</span>
                </div>
              );
           })}
        </div>
      )}
    </div>
  );
};

export default VillageDetails;
