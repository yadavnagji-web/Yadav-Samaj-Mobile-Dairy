
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Village, Contact, Bulletin, Banner, AppSettings, DynamicField, FieldType } from '../types';
import { addToCloud, updateInCloud, deleteFromCloud, saveSettingsToCloud } from '../services/firebase';

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

const SettingField: React.FC<{ label: string; val: string; onChange: (v: string) => void; placeholder?: string }> = ({ label, val, onChange, placeholder }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">{label}</label>
    <input 
      placeholder={placeholder}
      className="w-full p-5 bg-white rounded-2xl font-bold border-2 border-slate-100 focus:border-indigo-400 transition-all outline-none" 
      value={val} 
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);

const AdminSidebarItem = ({ to, label, icon, active }: any) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black transition-all ${
      active 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
    }`}
  >
    <span>{label}</span>
  </Link>
);

const AdminSettings: React.FC<AdminProps> = ({ settings, setSettings }) => {
  const [testMobile, setTestMobile] = useState('9982151938');
  const [testResult, setTestResult] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const save = async () => {
    try {
      await saveSettingsToCloud(settings);
      alert("सेटिंग्स सुरक्षित कर दी गई हैं।");
    } catch (err) {
      alert("सेटिंग्स सेव करने में त्रुटि आई।");
    }
  };

  const handleTestSms = async () => {
    setIsTesting(true);
    setTestResult('');
    const testOtp = "1234";
    const apiUrl = 'https://www.fast2sms.com/dev/bulkV2';
    const proxyUrl = 'https://corsproxy.io/?';
    const finalUrl = `${proxyUrl}${encodeURIComponent(apiUrl)}`;

    try {
      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'authorization': settings.whatsappApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "route": "dlt",
          "sender_id": settings.messageId || "11232",
          "message": settings.templateId,
          "variables_values": testOtp,
          "numbers": testMobile,
        })
      });
      const data = await response.json();
      setTestResult(data.return ? "✅ सफलतापूर्वक भेजा गया!" : `❌ API एरर: ${data.message}`);
    } catch (err) {
      setTestResult("❌ नेटवर्क एरर: कृपया इंटरनेट चेक करें।");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-green-600 p-12 rounded-[3.5rem] text-white shadow-2xl">
        <h3 className="text-4xl font-black mb-2">सिस्टम सेटिंग्स</h3>
        <p className="text-green-100 font-bold opacity-80">डायरी मैनेजमेंट एवं API</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 space-y-8 shadow-sm">
        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
          <h4 className="font-black text-xs uppercase tracking-[0.2em] text-indigo-600">Fast2SMS API Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingField label="API Key" val={settings.whatsappApiKey} onChange={v => setSettings({...settings, whatsappApiKey: v})} />
            <SettingField label="DLT Template ID" val={settings.templateId} onChange={v => setSettings({...settings, templateId: v})} />
            <SettingField label="Message ID (Sender)" val={settings.messageId} onChange={v => setSettings({...settings, messageId: v})} />
            <SettingField label="डायरी वर्ष" val={settings.diaryYear} onChange={v => setSettings({...settings, diaryYear: v})} />
          </div>
        </div>

        <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 space-y-4">
           <h4 className="font-black text-[10px] uppercase tracking-widest text-amber-700">SMS टेस्ट यूनिट (Auto-Proxy Active)</h4>
           <div className="flex gap-4">
              <input 
                type="tel" 
                className="flex-1 p-4 rounded-xl border border-amber-200 font-bold text-sm outline-none focus:border-amber-500" 
                value={testMobile} 
                onChange={e => setTestMobile(e.target.value)} 
              />
              <button 
                onClick={handleTestSms} 
                disabled={isTesting}
                className="bg-amber-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase transition-all active:scale-95 disabled:opacity-50"
              >
                {isTesting ? 'भेज रहे हैं...' : 'टेस्ट SMS भेजें'}
              </button>
           </div>
           {testResult && (
             <div className={`p-4 rounded-xl text-[10px] font-black uppercase mt-2 ${testResult.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {testResult}
             </div>
           )}
        </div>

        <button 
          onClick={save} 
          className="w-full bg-indigo-700 text-white py-7 rounded-[2.5rem] font-black shadow-2xl shadow-indigo-100 active:scale-95 transition-all hover:bg-indigo-800"
        >
          सेटिंग्स सुरक्षित करें
        </button>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<AdminProps> = (props) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm">
        <h2 className="text-3xl font-black text-indigo-900 mb-6">डैशबोर्ड सारांश</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100">
            <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-widest mb-2">कुल गाँव</h3>
            <p className="text-4xl font-black text-indigo-700">{props.villages.length}</p>
          </div>
          <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
            <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-widest mb-2">कुल संपर्क</h3>
            <p className="text-4xl font-black text-emerald-700">{props.contacts.length}</p>
          </div>
          <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100">
            <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-widest mb-2">सक्रिय बुलेटिन</h3>
            <p className="text-4xl font-black text-amber-700">{props.bulletins.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin: React.FC<AdminProps> = (props) => {
  const location = useLocation();

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
      <aside className="w-full md:w-64 space-y-2">
        <div className="px-6 py-4 mb-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">एडमिन कंट्रोल</h2>
        </div>
        <AdminSidebarItem to="/admin" label="डैशबोर्ड" active={location.pathname === '/admin'} />
        <AdminSidebarItem to="/admin/settings" label="सेटिंग्स" active={location.pathname === '/admin/settings'} />
      </aside>

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<AdminDashboard {...props} />} />
          <Route path="/settings" element={<AdminSettings {...props} />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
