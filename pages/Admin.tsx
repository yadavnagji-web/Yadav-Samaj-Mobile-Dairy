
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Village, Contact, AppSettings } from '../types';
import { 
  saveSettingsToCloud, 
  addToCloud, 
  updateInCloud, 
  deleteFromCloud,
  uploadFileToStorage 
} from '../services/firebase';
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

  // Form States
  const [vName, setVName] = useState('');
  const [vTehsil, setVTehsil] = useState('');
  const [vDistrict, setVDistrict] = useState('Dungarpur');
  const [mSearch, setMSearch] = useState('');

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
      alert("सेटिंग्स और API कुंजियाँ क्लाउड पर सुरक्षित कर दी गई हैं! ✅");
    } catch (e) {
      alert("त्रुटि! डेटाबेस से संपर्क नहीं हो पाया।");
    } finally {
      setLoading(false);
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
        
        const villageName = row['गाँव'] || row['village'] || row['Village'] || row['सदस्य का गाँव'];
        const name = row['नाम'] || row['name'] || row['Name'] || row['सदस्य का नाम'];
        const mobile = row['मोबाइल'] || row['mobile'] || row['Mobile'] || row['मोबाइल नंबर'];
        const father = row['पिता का नाम'] || row['father'] || row['Father Name'] || 'अज्ञात';
        
        const village = props.villages.find(v => v.name === String(villageName).trim());
        
        if (village && name && mobile) {
           await addToCloud('contacts', {
              name: String(name),
              fatherName: String(father),
              mobile: String(mobile).replace(/\D/g, '').slice(-10),
              villageId: village.id,
              isActive: true,
              isDeleted: false,
              dynamicValues: {}
           });
           successCount++;
        }
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

  const handleAddVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName || !vTehsil) return alert("नाम और तहसील अनिवार्य हैं");
    setLoading(true);
    try {
      await addToCloud('villages', {
        name: vName,
        tehsil: vTehsil,
        district: vDistrict,
        villageCode: Date.now().toString(),
        isDeleted: false,
        order: props.villages.length + 1
      });
      setVName(''); setVTehsil('');
    } catch (err) { alert("गाँव जोड़ने में त्रुटि"); }
    finally { setLoading(false); }
  };

  const handleDeleteVillage = async (id: string) => {
    if (window.confirm("क्या आप वाकई इस गाँव को हटाना चाहते हैं?")) {
      await updateInCloud('villages', id, { isDeleted: true });
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm("क्या आप इस सदस्य को हटाना चाहते हैं?")) {
      await updateInCloud('contacts', id, { isDeleted: true });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50/30 p-2 md:p-4 gap-4">
      <aside className="w-full md:w-48 space-y-2 shrink-0 flex flex-col">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-2">
           <h1 className="text-xs font-heavy-custom text-slate-800 uppercase tracking-tighter leading-tight">यादव समाज<br/>वागड़ चौरासी</h1>
           <p className="text-[7px] font-light-custom text-indigo-400 uppercase tracking-[0.2em] mt-1">v1.1.0 - CONTROL</p>
        </div>
        
        <nav className="space-y-1 flex-1">
          <SidebarItem path="" label="डैशबोर्ड" icon="⚡" />
          <SidebarItem path="/villages" label="गाँव सूची" icon="🏘️" />
          <SidebarItem path="/members" label="सदस्य" icon="👥" />
          <SidebarItem path="/settings" label="API एवं ब्रांडिंग" icon="🎨" />
        </nav>

        <div className="pt-4 space-y-1 border-t border-slate-200 mt-4">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2 px-4 py-3 text-slate-500 font-light-custom text-[8px] uppercase tracking-widest hover:text-indigo-600 transition-all w-full text-left bg-white rounded-xl mb-1 shadow-sm border border-slate-50">
            <span>🏠</span>
            <span>Exit to Home</span>
          </button>
          <button onClick={() => { props.onLogout(); navigate('/'); }} className="flex items-center space-x-2 px-4 py-3 text-rose-600 font-heavy-custom text-[8px] uppercase tracking-widest hover:bg-rose-50 transition-all w-full text-left bg-white rounded-xl shadow-sm border border-rose-100">
            <span>🔴</span>
            <span>Logout Panel</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 space-y-4 max-w-5xl">
        <Routes>
          <Route path="/" element={
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-2">
                 <StatsCard label="गाँव" count={props.villages.filter(v=>!v.isDeleted).length} icon="🏘️" color="indigo" />
                 <StatsCard label="सदस्य" count={props.contacts.filter(c=>!c.isDeleted).length} icon="👥" color="purple" />
                 <StatsCard label="सक्रिय" count={props.contacts.filter(c=>!c.isDeleted && c.isActive).length} icon="✨" color="amber" />
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-[9px] font-heavy-custom text-slate-800 mb-4 flex items-center space-x-2 uppercase tracking-widest">त्वरित कार्यवाही</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <QuickAction title="प्रिंट PDF" sub="Full Sync" icon="🖨️" bg="bg-indigo-600" onClick={() => window.print()} />
                  <QuickAction title="Excel Backup" sub="Download" icon="📥" bg="bg-emerald-600" onClick={() => exportContactsToExcel(props.contacts, props.villages)} />
                  <div className="relative">
                    <input type="file" id="bulk-upload-input" className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
                    <QuickAction 
                      title={loading && uploadStatus ? uploadStatus : "Excel Import"} 
                      sub={loading ? "अपलोड हो रहा है..." : "बल्क डेटा"} 
                      icon={loading ? "⌛" : "📤"} 
                      bg={loading ? "bg-amber-500" : "bg-slate-800"} 
                      onClick={() => !loading && document.getElementById('bulk-upload-input')?.click()} 
                    />
                  </div>
                </div>
              </div>
            </div>
          } />

          <Route path="/villages" element={
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-heavy-custom text-slate-800 mb-4 uppercase tracking-widest">नया गाँव जोड़ें</h3>
                <form onSubmit={handleAddVillage} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input placeholder="गाँव का नाम" className="p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-indigo-100 text-xs font-bold" value={vName} onChange={e=>setVName(e.target.value)} />
                  <input placeholder="तहसील" className="p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-indigo-100 text-xs font-bold" value={vTehsil} onChange={e=>setVTehsil(e.target.value)} />
                  <select className="p-3 bg-slate-50 rounded-xl text-xs font-bold" value={vDistrict} onChange={e=>setVDistrict(e.target.value)}>
                    <option value="Dungarpur">डूंगरपुर</option>
                    <option value="Banswara">बांसवाड़ा</option>
                  </select>
                  <button type="submit" disabled={loading} className="bg-indigo-600 text-white font-heavy-custom rounded-xl text-[9px] uppercase tracking-widest p-3">गाँव जोड़ें +</button>
                </form>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[8px] font-heavy-custom text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">गाँव का नाम</th>
                      <th className="px-6 py-4">तहसील</th>
                      <th className="px-6 py-4 text-right">कार्यवाही</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {props.villages.filter(v=>!v.isDeleted).map(v => (
                      <tr key={v.id} className="text-xs font-bold text-slate-700">
                        <td className="px-6 py-4">{v.name}</td>
                        <td className="px-6 py-4">{v.tehsil}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={()=>handleDeleteVillage(v.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">हटाएँ</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          } />

          <Route path="/members" element={
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center px-6">
                <span className="text-slate-400 mr-4">🔍</span>
                <input placeholder="सदस्य खोजें (नाम या मोबाइल)..." className="flex-1 outline-none text-sm font-bold bg-transparent" value={mSearch} onChange={e=>setMSearch(e.target.value)} />
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-[8px] font-heavy-custom text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">नाम</th>
                      <th className="px-6 py-4">पिता</th>
                      <th className="px-6 py-4">मोबाइल</th>
                      <th className="px-6 py-4">गाँव</th>
                      <th className="px-6 py-4 text-right">कार्यवाही</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {props.contacts.filter(c=>!c.isDeleted && (c.name.toLowerCase().includes(mSearch.toLowerCase()) || c.mobile.includes(mSearch))).slice(0, 100).map(c => (
                      <tr key={c.id} className="text-xs font-bold text-slate-700">
                        <td className="px-6 py-4">{c.name}</td>
                        <td className="px-6 py-4">{c.fatherName}</td>
                        <td className="px-6 py-4">{c.mobile}</td>
                        <td className="px-6 py-4 text-indigo-600">{props.villages.find(v=>v.id===c.villageId)?.name}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={()=>handleDeleteMember(c.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">हटाएँ</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          } />

          <Route path="/settings" element={
            <div className="space-y-4 animate-fade-in pb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-[10px] font-heavy-custom text-slate-800 flex items-center space-x-2 uppercase tracking-widest">
                  <span className="bg-indigo-50 p-1 rounded-lg text-sm">🤖</span>
                  <span>AI API Configurations (Saved to Firebase)</span>
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gemini AI Key (Primary)</label>
                    <input type="password" placeholder="AIzaSy..." className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-indigo-100 text-xs font-bold font-mono" value={props.settings.aiKeyPrimary} onChange={e=>props.setSettings({...props.settings, aiKeyPrimary: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Groq API Key (Secondary/Fallback)</label>
                    <input type="password" placeholder="gsk_..." className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-indigo-100 text-xs font-bold font-mono" value={props.settings.aiKeySecondary} onChange={e=>props.setSettings({...props.settings, aiKeySecondary: e.target.value})} />
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-6"></div>

                <h3 className="text-[10px] font-heavy-custom text-slate-800 flex items-center space-x-2 uppercase tracking-widest">
                  <span className="bg-indigo-50 p-1 rounded-lg text-sm">🎨</span>
                  <span>ब्रांडिंग सेटिंग्स</span>
                </h3>
                <UploadBox 
                  id="admin-bg-upload" 
                  label="ऐप बैकग्राउंड इमेज" 
                  value={props.settings.backgroundImageUrl} 
                  onUpload={(e: any) => {
                    const file = e.target.files?.[0];
                    if(file) uploadFileToStorage(file, 'branding', p=>setImgUploadProgress({bg: `${p}%`})).then(url=>props.setSettings({...props.settings, backgroundImageUrl: url}));
                  }} 
                  progress={imgUploadProgress['bg']}
                  onRemove={() => props.setSettings({...props.settings, backgroundImageUrl: ''})} 
                />
              </div>

              <button 
                onClick={handleSaveSettings} 
                disabled={loading}
                className="w-full text-white font-heavy-custom py-5 rounded-xl shadow-lg transition-all text-[10px] uppercase tracking-[0.3em] bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? 'सुरक्षित हो रहा है...' : 'Brand & API Settings सुरक्षित करें 🚀'}
              </button>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

const StatsCard = ({ label, count, icon, color }: any) => {
  const themes: any = { indigo: 'bg-indigo-50 text-indigo-600', purple: 'bg-purple-50 text-purple-600', amber: 'bg-amber-50 text-amber-600' };
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-2">
       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${themes[color]}`}>{icon}</div>
       <div><p className="text-[7px] font-light-custom text-slate-400 uppercase tracking-widest leading-none mb-0.5">{label}</p><h4 className="text-lg font-heavy-custom text-slate-800 tracking-tighter leading-none">{count}</h4></div>
    </div>
  );
};

const QuickAction = ({ title, sub, icon, bg, onClick }: any) => (
  <button onClick={onClick} className={`w-full p-3 ${bg} text-white rounded-xl font-heavy-custom flex flex-col items-center justify-center space-y-1 hover:opacity-95 transition-all active:scale-95 shadow-sm`}>
    <span className="text-lg">{icon}</span><div className="text-center"><p className="text-[9px] leading-tight">{title}</p><p className="text-[6px] uppercase tracking-widest opacity-60 font-light-custom">{sub}</p></div>
  </button>
);

const UploadBox = ({ id, label, value, onUpload, onRemove, progress }: any) => (
  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center space-x-3">
    <div className="w-14 h-14 bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
      {value ? <img src={value} className="w-full h-full object-cover" alt="P" /> : <div className="text-[6px] text-slate-300 text-center">NO IMAGE</div>}
    </div>
    <div className="flex-1">
      <p className="text-[8px] font-light-custom text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-center space-x-2">
        <label htmlFor={id} className="px-3 py-1 bg-indigo-600 text-white font-heavy-custom text-[7px] uppercase tracking-widest rounded cursor-pointer">{progress || 'चुनें'}</label>
        <input id={id} type="file" onChange={onUpload} className="hidden" />
        {value && <button onClick={onRemove} className="text-[7px] text-rose-500 uppercase font-bold">हटाएँ</button>}
      </div>
    </div>
  </div>
);

export default Admin;
