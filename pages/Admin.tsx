
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Village, Contact, AppSettings } from '../types';
import { saveSettingsToCloud, updateInCloud, addToCloud, deleteFromCloud } from '../services/firebase';
import { exportContactsToExcel, parseContactsFromExcel } from '../utils/exportUtils';
import { updateServiceSettings } from '../services/geminiService';

interface AdminProps {
  villages: Village[];
  setVillages: any;
  contacts: Contact[];
  setContacts: any;
  settings: AppSettings;
  setSettings: (val: AppSettings) => void;
}

const Admin: React.FC<AdminProps> = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [showAddVillageModal, setShowAddVillageModal] = useState(false);
  const [newVillage, setNewVillage] = useState({ name: '', tehsil: 'अज्ञात', district: 'जालौर' });
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedVillageFilter, setSelectedVillageFilter] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    updateServiceSettings(props.settings);
  }, [props.settings]);

  const SidebarItem = ({ path, label, icon }: any) => {
    const isActive = location.pathname === `/admin${path}`;
    return (
      <Link 
        to={`/admin${path}`} 
        className={`flex items-center space-x-5 px-8 py-5 rounded-[2.25rem] font-heavy-custom text-sm transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-indigo-600 to-indigo-900 text-white shadow-2xl shadow-indigo-100 translate-x-3 scale-105' : 'text-slate-400 hover:bg-white hover:shadow-lg'}`}
      >
        <span className="text-2xl">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await saveSettingsToCloud(props.settings);
      alert("सेटिंग्स सुरक्षित कर दी गई हैं!");
    } catch (e) {
      alert("त्रुटि! डेटाबेस से संपर्क नहीं हो पाया।");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'backgroundImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("फाइल बहुत बड़ी है! कृपया 2MB से छोटी इमेज चुनें।");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      props.setSettings({ ...props.settings, [field]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadStatus('फाइल पढ़ी जा रही है...');
    try {
      const rows = await parseContactsFromExcel(file);
      if (!rows || rows.length === 0) {
        alert("Excel फाइल खाली है या फॉर्मेट गलत है।");
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const villageName = row['गाँव'] || row['village'];
        const name = row['नाम'] || row['name'];
        const fatherName = row['पिता का नाम'] || row['fatherName'];
        const mobile = row['मोबाइल नंबर'] || row['mobile'];
        const profession = row['पेशा'] || row['profession'] || 'किसान';

        if (!name || !mobile) {
          failCount++;
          continue;
        }

        const village = props.villages.find(v => v.name === villageName && !v.isDeleted);
        
        if (village) {
          setUploadStatus(`अपलोड: ${i + 1}/${rows.length}`);
          await addToCloud('contacts', {
            name: String(name),
            fatherName: String(fatherName || 'अज्ञात'),
            mobile: String(mobile).replace(/\D/g, '').slice(-10),
            villageId: village.id,
            profession: String(profession),
            isActive: true,
            isDeleted: false,
            dynamicValues: {}
          });
          successCount++;
        } else {
          failCount++;
        }
      }

      alert(`बल्क अपलोड पूरा हुआ!\nसफल: ${successCount}\nविफल: ${failCount}`);
    } catch (err) {
      console.error(err);
      alert("Excel अपलोड में त्रुटि हुई।");
    } finally {
      setLoading(false);
      setUploadStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-transparent p-6 md:p-12 gap-8 lg:gap-12">
      <aside className="w-full md:w-80 space-y-6">
        <div className="mb-10 px-6 flex items-center justify-between md:block">
           <div className="bg-white p-10 rounded-[3rem] border border-white shadow-2xl">
             <h1 className="text-2xl font-heavy-custom text-slate-800 uppercase tracking-tight leading-none">Admin Panel</h1>
             <p className="text-[10px] font-light-custom text-indigo-400 uppercase tracking-[0.5em] mt-4">Control Center</p>
           </div>
           <button onClick={() => navigate('/')} className="md:hidden p-5 bg-white rounded-[2rem] shadow-xl text-indigo-600 active:scale-90">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           </button>
        </div>
        
        <nav className="space-y-3">
          <SidebarItem path="" label="डैशबोर्ड" icon="⚡" />
          <SidebarItem path="/villages" label="गाँव प्रबंधन" icon="🏘️" />
          <SidebarItem path="/members" label="सदस्य डेटा" icon="👥" />
          <SidebarItem path="/settings" label="ब्रांडिंग" icon="🎨" />
        </nav>

        <div className="hidden md:block pt-16">
          <Link to="/" className="flex items-center space-x-5 px-10 py-6 bg-white/50 backdrop-blur-md rounded-[2.5rem] text-slate-400 font-light-custom text-[11px] uppercase tracking-widest hover:text-indigo-600 hover:bg-white shadow-sm transition-all border border-transparent hover:border-indigo-100">
            <span>🏠</span>
            <span>Back Home</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 space-y-10 overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={
            <div className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <StatsCard label="विलेज" count={props.villages.filter(v=>!v.isDeleted).length} icon="🏠" color="indigo" />
                 <StatsCard label="सदस्य" count={props.contacts.filter(c=>!c.isDeleted).length} icon="👥" color="purple" />
                 <StatsCard label="तहसील" count={[...new Set(props.villages.filter(v=>!v.isDeleted).map(v=>v.tehsil))].length} icon="📍" color="amber" />
              </div>
              
              <div className="bg-white/95 backdrop-blur-xl p-12 rounded-[4rem] border border-white shadow-2xl">
                <h3 className="text-2xl font-heavy-custom text-slate-800 mb-10 flex items-center space-x-5">
                   <span className="bg-indigo-50 p-4 rounded-3xl text-2xl">⚙️</span>
                   <span>Admin Actions</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <QuickAction title="प्रिंट डायरेक्टरी" sub="QR कोड PDF" icon="🖨️" bg="bg-indigo-600" onClick={() => window.print()} />
                  <QuickAction title="Excel बैकअप" sub="Full Database" icon="📥" bg="bg-emerald-500" onClick={() => exportContactsToExcel(props.contacts, props.villages)} />
                  <div className="relative group">
                    <input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={handleExcelImport} />
                    <QuickAction 
                      title={loading ? uploadStatus : "बल्क अपलोड"} 
                      sub="Excel Import" 
                      icon="📤" 
                      bg="bg-indigo-800" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          } />

          <Route path="/settings" element={
            <div className="space-y-10 animate-fade-in pb-12">
              <div className="bg-white/95 backdrop-blur-xl p-12 rounded-[4rem] border border-white shadow-2xl">
                <div className="mb-12 border-b border-slate-100 pb-10">
                  <h3 className="text-2xl font-heavy-custom text-slate-800 flex items-center space-x-5">
                    <span className="bg-indigo-50 p-4 rounded-3xl text-2xl">🎨</span>
                    <span>ब्रांडिंग सेटिंग्स</span>
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <UploadBox id="logo-upload" label="App Logo" value={props.settings.logoUrl} onUpload={(e) => handleFileUpload(e, 'logoUrl')} isLogo />
                  <UploadBox id="bg-upload" label="App Background" value={props.settings.backgroundImageUrl} onUpload={(e) => handleFileUpload(e, 'backgroundImageUrl')} onRemove={() => props.setSettings({...props.settings, backgroundImageUrl: ''})} />
                </div>
              </div>

              <button 
                onClick={handleSaveSettings} 
                disabled={loading}
                className={`w-full text-white font-heavy-custom py-10 rounded-[3rem] shadow-2xl transition-all text-sm uppercase tracking-[0.5em] flex items-center justify-center space-x-6 ${loading ? 'bg-slate-400' : 'bg-slate-900 hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {loading ? 'सुरक्षित हो रहा है...' : 'Update Admin Panel Settings 🚀'}
              </button>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

const StatsCard = ({ label, count, icon, color }: any) => {
  const themes: any = { 
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100', 
    purple: 'bg-purple-50 text-purple-600 border-purple-100', 
    amber: 'bg-amber-50 text-amber-600 border-amber-100' 
  };
  return (
    <div className="bg-white p-10 rounded-[3.5rem] border border-white shadow-2xl flex items-center space-x-8 hover:-translate-y-2 transition-all">
       <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner border transition-transform ${themes[color]}`}>{icon}</div>
       <div>
          <p className="text-[11px] font-light-custom text-slate-400 uppercase tracking-[0.3em] mb-2">{label}</p>
          <h4 className="text-4xl font-heavy-custom text-slate-800 tracking-tighter">{count}</h4>
       </div>
    </div>
  );
};

const QuickAction = ({ title, sub, icon, bg, onClick, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full p-10 ${bg} text-white rounded-[3.5rem] font-heavy-custom flex flex-col items-center justify-center space-y-4 hover:shadow-2xl hover:scale-105 transition-all active:scale-95 shadow-xl`}
  >
    <span className="text-4xl bg-white/20 p-4 rounded-3xl backdrop-blur-md">{icon}</span>
    <div className="text-center">
      <p className="text-base leading-none mb-1">{title}</p>
      <p className="text-[10px] uppercase tracking-widest opacity-60 font-light-custom">{sub}</p>
    </div>
  </button>
);

const UploadBox = ({ id, label, value, onUpload, onRemove, isLogo }: any) => (
  <div className="space-y-5 p-10 bg-slate-50 rounded-[3.5rem] border border-slate-100 shadow-inner">
    <label className="text-xs font-light-custom text-slate-400 uppercase tracking-widest ml-4 block">{label}</label>
    <div className="flex items-center space-x-8">
      <div className={`w-28 h-28 bg-white rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden flex-shrink-0 flex items-center justify-center ${!isLogo && 'p-0'} ${isLogo && 'p-4'}`}>
        {value ? <img src={value} className={`${isLogo ? 'max-w-full max-h-full object-contain' : 'w-full h-full object-cover'}`} alt="Preview" /> : <span className="text-slate-200 font-heavy-custom text-[9px]">EMPTY</span>}
      </div>
      <div className="flex-1 space-y-3">
        <label htmlFor={id} className="block w-full text-center py-4 bg-indigo-600 text-white font-heavy-custom text-[10px] uppercase tracking-widest rounded-2xl cursor-pointer hover:bg-indigo-700 transition-all shadow-lg">चुनें</label>
        <input id={id} type="file" accept="image/*" onChange={onUpload} className="hidden" />
        {onRemove && value && <button onClick={onRemove} className="w-full text-[10px] font-light-custom text-rose-500 uppercase tracking-widest underline">हटाएँ</button>}
      </div>
    </div>
  </div>
);

export default Admin;
