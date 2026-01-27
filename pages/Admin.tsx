
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Village, Contact, AppSettings } from '../types';
import { saveSettingsToCloud, addToCloud, uploadFileToStorage } from '../services/firebase';
import { exportContactsToExcel, parseContactsFromExcel } from '../utils/exportUtils';
import { updateServiceSettings } from '../services/geminiService';

interface AdminProps {
  villages: Village[];
  setVillages: any;
  contacts: Contact[];
  setContacts: any;
  settings: AppSettings;
  setSettings: (val: AppSettings) => void;
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [imgUploadProgress, setImgUploadProgress] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    updateServiceSettings(props.settings);
  }, [props.settings]);

  const SidebarItem = ({ path, label, icon }: any) => {
    const isActive = location.pathname === `/admin${path}`;
    return (
      <Link 
        to={`/admin${path}`} 
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-heavy-custom text-[10px] transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
      >
        <span className="text-base">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await saveSettingsToCloud(props.settings);
      alert("सेटिंग्स क्लाउड पर सुरक्षित कर दी गई हैं! ✅");
    } catch (e) {
      alert("त्रुटि! डेटाबेस से संपर्क नहीं हो पाया।");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAction = () => {
    if (window.confirm("क्या आप वाकई लॉगआउट करना चाहते हैं?")) {
      props.onLogout();
      navigate('/');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'backgroundImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("फाइल बहुत बड़ी है! कृपया 5MB से छोटी इमेज चुनें।");
      return;
    }

    try {
      setImgUploadProgress(prev => ({ ...prev, [field]: '0%' }));
      const downloadURL = await uploadFileToStorage(file, 'branding', (progress) => {
        setImgUploadProgress(prev => ({ ...prev, [field]: `${progress}%` }));
      });
      
      props.setSettings({ ...props.settings, [field]: downloadURL });
      setImgUploadProgress(prev => ({ ...prev, [field]: 'DONE' }));
      setTimeout(() => setImgUploadProgress(prev => ({ ...prev, [field]: '' })), 2000);
    } catch (error) {
      alert("अपलोड विफल रहा। कृपया नेटवर्क चेक करें।");
      setImgUploadProgress(prev => ({ ...prev, [field]: '' }));
    } finally {
      e.target.value = '';
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadStatus('0%');
    try {
      const rows = await parseContactsFromExcel(file);
      if (!rows || rows.length === 0) {
        alert("Excel फाइल खाली है।");
        setLoading(false);
        return;
      }

      let successCount = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const percent = Math.round(((i + 1) / rows.length) * 100);
        setUploadStatus(`${percent}%`);
        
        const villageName = row['गाँव'] || row['village'] || row['Village'];
        const name = row['नाम'] || row['name'] || row['Name'];
        const mobile = row['मोबाइल'] || row['mobile'] || row['Mobile'];
        
        const village = props.villages.find(v => v.name === String(villageName).trim());
        
        if (village && name && mobile) {
           await addToCloud('contacts', {
              name: String(name),
              fatherName: row['पिता का नाम'] || row['father'] || 'अज्ञात',
              mobile: String(mobile).replace(/\D/g, '').slice(-10),
              villageId: village.id,
              isActive: true,
              isDeleted: false,
              dynamicValues: {}
           });
           successCount++;
        }
        if (i % 5 === 0) await new Promise(r => setTimeout(r, 10));
      }
      alert(`${successCount} सदस्य सफलतापूर्वक इम्पोर्ट किए गए।`);
    } catch (err) {
      alert("Excel अपलोड में त्रुटि हुई।");
    } finally {
      setLoading(false);
      setUploadStatus('');
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50/30 p-2 md:p-4 gap-4">
      <aside className="w-full md:w-48 space-y-2 shrink-0 flex flex-col">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-2">
           <h1 className="text-xs font-heavy-custom text-slate-800 uppercase tracking-tighter">SAMAJ ADMIN</h1>
           <p className="text-[7px] font-light-custom text-indigo-400 uppercase tracking-[0.2em] mt-1">Control v1.0.6</p>
        </div>
        
        <nav className="space-y-1 flex-1">
          <SidebarItem path="" label="डैशबोर्ड" icon="⚡" />
          <SidebarItem path="/villages" label="गाँव सूची" icon="🏘️" />
          <SidebarItem path="/members" label="सदस्य" icon="👥" />
          <SidebarItem path="/settings" label="ब्रांडिंग" icon="🎨" />
        </nav>

        <div className="pt-4 space-y-1 border-t border-slate-200 mt-4">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2 px-4 py-3 text-slate-500 font-light-custom text-[8px] uppercase tracking-widest hover:text-indigo-600 transition-all w-full text-left bg-white rounded-xl mb-1 shadow-sm border border-slate-50">
            <span>🏠</span>
            <span>Exit to Home</span>
          </button>
          
          <button onClick={handleLogoutAction} className="flex items-center space-x-2 px-4 py-3 text-rose-600 font-heavy-custom text-[8px] uppercase tracking-widest hover:bg-rose-50 transition-all w-full text-left bg-white rounded-xl shadow-sm border border-rose-100">
            <span>🔴</span>
            <span>Logout Panel</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 space-y-4">
        <Routes>
          <Route path="/" element={
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-2">
                 <StatsCard label="गाँव" count={props.villages.filter(v=>!v.isDeleted).length} icon="🏘️" color="indigo" />
                 <StatsCard label="सदस्य" count={props.contacts.filter(c=>!c.isDeleted).length} icon="👥" color="purple" />
                 <StatsCard label="सक्रिय" count={props.contacts.filter(c=>!c.isDeleted && c.isActive).length} icon="✨" color="amber" />
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-[9px] font-heavy-custom text-slate-800 mb-4 flex items-center space-x-2 uppercase tracking-widest">
                   <span className="bg-indigo-50 p-1 rounded-lg text-sm">⚙️</span>
                   <span>त्वरित कार्यवाही</span>
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <QuickAction title="प्रिंट PDF" sub="Full Sync" icon="🖨️" bg="bg-indigo-600" onClick={() => window.print()} />
                  <QuickAction title="Excel Backup" sub="Download" icon="📥" bg="bg-emerald-600" onClick={() => exportContactsToExcel(props.contacts, props.villages)} />
                  <div className="relative">
                    <input type="file" id="bulk-upload-input" className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
                    <QuickAction 
                      title={loading && uploadStatus ? uploadStatus : "Import Excel"} 
                      sub={loading ? "प्रगति पर..." : "Bulk Upload"} 
                      icon={loading ? "⌛" : "📤"} 
                      bg={loading ? "bg-amber-500" : "bg-slate-800"} 
                      onClick={() => !loading && document.getElementById('bulk-upload-input')?.click()} 
                    />
                  </div>
                </div>
              </div>
            </div>
          } />

          <Route path="/settings" element={
            <div className="space-y-4 animate-fade-in pb-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-[9px] font-heavy-custom text-slate-800 flex items-center space-x-2 mb-4 uppercase tracking-widest">
                  <span className="bg-indigo-50 p-1 rounded-lg text-sm">🎨</span>
                  <span>एप थीम एवं बैकग्राउंड</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <UploadBox 
                    id="admin-bg-upload" 
                    label="App Background Image" 
                    value={props.settings.backgroundImageUrl} 
                    onUpload={(e) => handleImageUpload(e, 'backgroundImageUrl')} 
                    progress={imgUploadProgress['backgroundImageUrl']}
                    onRemove={() => props.setSettings({...props.settings, backgroundImageUrl: ''})} 
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveSettings} 
                disabled={loading}
                className={`w-full text-white font-heavy-custom py-4 rounded-xl shadow-lg transition-all text-[9px] uppercase tracking-[0.3em] flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {loading ? 'सुरक्षित हो रहा है...' : 'Brand Settings अपडेट करें 🚀'}
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
    indigo: 'bg-indigo-50 text-indigo-600', 
    purple: 'bg-purple-50 text-purple-600', 
    amber: 'bg-amber-50 text-amber-600' 
  };
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-2">
       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${themes[color]}`}>{icon}</div>
       <div>
          <p className="text-[7px] font-light-custom text-slate-400 uppercase tracking-widest leading-none mb-0.5">{label}</p>
          <h4 className="text-lg font-heavy-custom text-slate-800 tracking-tighter leading-none">{count}</h4>
       </div>
    </div>
  );
};

const QuickAction = ({ title, sub, icon, bg, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full p-3 ${bg} text-white rounded-xl font-heavy-custom flex flex-col items-center justify-center space-y-1 hover:opacity-95 transition-all active:scale-95 shadow-sm`}
  >
    <span className="text-lg">{icon}</span>
    <div className="text-center">
      <p className="text-[9px] leading-tight">{title}</p>
      <p className="text-[6px] uppercase tracking-widest opacity-60 font-light-custom">{sub}</p>
    </div>
  </button>
);

const UploadBox = ({ id, label, value, onUpload, onRemove, progress }: any) => (
  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center space-x-3">
    <div className="w-14 h-14 bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
      {value ? (
        <img src={value} className="w-full h-full object-cover" alt="Preview" key={value} />
      ) : (
        <div className="text-[6px] font-light-custom text-slate-300">NO IMG</div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[8px] font-light-custom text-slate-400 uppercase tracking-widest mb-1 truncate">{label}</p>
      <div className="flex items-center space-x-2">
        <label htmlFor={id} className={`px-3 py-1 text-white font-heavy-custom text-[7px] uppercase tracking-widest rounded cursor-pointer transition-all shadow-sm ${progress ? 'bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {progress ? progress : 'चुनें'}
        </label>
        <input id={id} type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={!!progress} />
        {onRemove && value && !progress && <button onClick={onRemove} className="text-[7px] font-light-custom text-rose-500 uppercase tracking-widest underline">हटाएँ</button>}
      </div>
    </div>
  </div>
);

export default Admin;
