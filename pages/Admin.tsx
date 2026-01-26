
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Village, Contact, Bulletin, Banner, AppSettings, DynamicField, FieldType } from '../types';
import { saveSettingsToCloud, addToCloud } from '../services/firebase';
import { isHindiOnly } from '../utils/validation';

interface AdminProps {
  villages: Village[];
  setVillages: (val: Village[]) => void;
  contacts: Contact[];
  setContacts: (val: Contact[]) => void;
  fields: DynamicField[];
  setFields: (val: DynamicField[]) => void;
  bulletins: Bulletin[];
  setBulletins: (val: Bulletin[]) => void;
  banners: Banner[];
  setBanners: (val: Banner[]) => void;
  settings: AppSettings;
  setSettings: (val: AppSettings) => void;
}

const AdminSidebarItem = ({ to, label, active, icon }: any) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-6 py-3.5 rounded-2xl font-black transition-all ${active ? 'bg-indigo-700 text-white shadow-lg' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'}`}
  >
    <span className="text-lg">{icon}</span>
    <span className="text-sm">{label}</span>
  </Link>
);

const Admin: React.FC<AdminProps> = (props) => {
  const location = useLocation();
  const [name, setName] = useState('');
  const [tehsil, setTehsil] = useState('');

  const handleAddVillage = async () => {
    if (!name || !tehsil) return alert("कृपया जानकारी भरें।");
    if (!isHindiOnly(name) || !isHindiOnly(tehsil)) return alert("कृपया गाँव और तहसील का नाम केवल हिंदी में भरें।");
    await addToCloud('villages', { name, tehsil, district: 'डूंगरपुर', villageCode: 'V'+Date.now(), order: 0, isDeleted: false });
    setName(''); setTehsil('');
    alert("गाँव जोड़ दिया गया है।");
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[600px] pb-24">
      <aside className="w-full md:w-72 space-y-2">
        <AdminSidebarItem to="/admin" label="डैशबोर्ड" active={location.pathname === '/admin'} icon="🏠" />
        <AdminSidebarItem to="/admin/villages" label="गाँव मैनेजमेंट" active={location.pathname === '/admin/villages'} icon="🏘️" />
        <AdminSidebarItem to="/admin/settings" label="सेटिंग्स" active={location.pathname === '/admin/settings'} icon="⚙️" />
      </aside>
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<div className="bg-indigo-600 p-12 rounded-[3.5rem] text-white shadow-2xl font-black">यादव समाज वागड़ चौरासी मोबाइल डायरी मैनेजमेंट सक्रिय है।</div>} />
          <Route path="/villages" element={
            <div className="bg-white p-8 rounded-[2.5rem] space-y-6 shadow-sm border border-slate-50">
               <h3 className="text-xl font-black text-indigo-900">नया गाँव जोड़ें (केवल हिंदी)</h3>
               <div className="flex flex-col gap-4">
                  <input placeholder="गाँव का नाम" className={`p-4 bg-slate-50 rounded-xl font-bold border-2 outline-none ${!isHindiOnly(name) ? 'border-red-500 bg-red-50' : 'border-transparent'}`} value={name} onChange={e => setName(e.target.value)} />
                  <input placeholder="तहसील" className={`p-4 bg-slate-50 rounded-xl font-bold border-2 outline-none ${!isHindiOnly(tehsil) ? 'border-red-500 bg-red-50' : 'border-transparent'}`} value={tehsil} onChange={e => setTehsil(e.target.value)} />
                  <button onClick={handleAddVillage} className="bg-indigo-600 text-white font-black px-8 py-4 rounded-xl hover:bg-indigo-700">गाँव जोड़ें</button>
               </div>
            </div>
          } />
          <Route path="/settings" element={
            <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 space-y-8 shadow-sm">
              <h3 className="text-2xl font-black text-indigo-900">सिस्टम सेटिंग्स</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Authorization (API Key)</label>
                  <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-400" value={props.settings.whatsappApiKey || ''} onChange={e => props.setSettings({...props.settings, whatsappApiKey: e.target.value})} />
                </div>
              </div>
              <button onClick={() => saveSettingsToCloud(props.settings).then(() => alert("Saved!"))} className="w-full bg-indigo-700 text-white py-6 rounded-[2rem] font-black shadow-xl">सुरक्षित करें</button>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
