
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Village, Contact, AppSettings } from '../types';
import { 
  saveSettingsToCloud, 
  addToCloud, 
  updateInCloud, 
  deleteFromCloud,
  uploadFileToStorage,
  syncRecentLogs,
  db
} from '../services/firebase';
import { ref, remove } from 'firebase/database';
import { exportContactsToExcel, parseContactsFromExcel } from '../utils/exportUtils';

// Helper Components
const StatsCard: React.FC<{ label: string; count: number; icon: string; color: string }> = ({ label, count, icon, color }) => (
  <div className="card-premium p-6 flex items-center space-x-4 bg-white">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{count}</h4>
    </div>
  </div>
);

const SidebarItem: React.FC<{ path: string; label: string; icon: string; active: boolean }> = ({ path, label, icon, active }) => (
  <Link 
    to={`/admin${path}`} 
    className={`flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
      active ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-white hover:shadow-sm'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </Link>
);

const UploadBox: React.FC<{ id: string; label: string; value?: string; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemove: () => void; progress?: string }> = ({ id, label, value, onUpload, onRemove, progress }) => (
  <div className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-6">
    <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center">
      {value ? <img src={value} className="w-full h-full object-cover" alt="Branding" /> : <div className="text-[10px] text-gray-300 font-bold uppercase text-center p-2">No Image</div>}
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-center space-x-4">
        <label htmlFor={id} className="px-5 py-2.5 bg-black text-white rounded-xl font-bold text-[11px] uppercase cursor-pointer shadow-md">
          {progress || 'Upload Image'}
        </label>
        <input id={id} type="file" onChange={onUpload} className="hidden" />
        {value && <button onClick={onRemove} className="text-[11px] text-rose-500 font-bold uppercase hover:underline">Remove</button>}
      </div>
    </div>
  </div>
);

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
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  
  const [vName, setVName] = useState('');
  const [vTehsil, setVTehsil] = useState('');
  const [vDistrict, setVDistrict] = useState('Dungarpur');
  const [mSearch, setMSearch] = useState('');

  useEffect(() => {
    // Sync interactions for admin dashboard
    const unsubLogs = syncRecentLogs('ai_logs', 20, setAiLogs);
    return () => unsubLogs();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await saveSettingsToCloud(props.settings);
      alert("सेटिंग्स और सूचना क्लाउड पर सुरक्षित कर दी गई हैं! ✅");
    } catch (e) {
      alert("त्रुटि! डेटाबेस से संपर्क नहीं हो पाया।");
    } finally {
      setLoading(false);
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
      alert("गाँव सफलतापूर्वक जोड़ा गया!");
    } catch (err) { alert("गाँव जोड़ने में त्रुटि"); }
    finally { setLoading(false); }
  };

  const handleDeleteVillage = async (id: string) => {
    if (!id) return;
    if (window.confirm("क्या आप वाकई इस गाँव को हटाना चाहते हैं?")) {
      try { await deleteFromCloud('villages', id); } catch (e) {}
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!id) return;
    if (window.confirm("क्या आप इस सदस्य को स्थायी रूप से हटाना चाहते हैं?")) {
      setLoading(true);
      try {
        const memberRef = ref(db, `contacts/${id}`);
        await remove(memberRef);
      } catch (e) {
        alert("त्रुटि!");
      } finally { setLoading(false); }
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setUploadStatus('प्रगति: 0%');
    try {
      const rows = await parseContactsFromExcel(file);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        setUploadStatus(`प्रगति: ${Math.round(((i + 1) / rows.length) * 100)}%`);
        const villageName = row['गाँव'] || row['village'];
        const name = row['नाम'] || row['name'];
        const mobile = row['मोबाइल'] || row['mobile'];
        const father = row['पिता का नाम'] || row['father'] || 'अज्ञात';
        const village = props.villages.find(v => v.name.trim() === String(villageName || '').trim());
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
        }
      }
      alert("Excel डेटा अपलोड हुआ! ✅");
    } catch (err) { alert("इम्पोर्ट एरर!"); }
    finally { setLoading(false); setUploadStatus(''); }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F9FAFB] p-4 md:p-8 gap-8">
      <aside className="w-full md:w-72 space-y-4 shrink-0 flex flex-col">
        <div className="bg-black p-8 rounded-[2rem] text-white shadow-xl mb-4 relative overflow-hidden">
           <h1 className="text-xl font-bold uppercase tracking-tight">Admin Panel</h1>
           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-100 mt-2 opacity-60">Control Center</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          <SidebarItem path="" label="Dashboard" icon="📊" active={location.pathname === '/admin'} />
          <SidebarItem path="/villages" label="गाँव सूची" icon="🏘️" active={location.pathname === '/admin/villages'} />
          <SidebarItem path="/members" label="सदस्य प्रबंधन" icon="👥" active={location.pathname === '/admin/members'} />
          <SidebarItem path="/settings" label="AI एवं ब्रांडिंग" icon="⚙️" active={location.pathname === '/admin/settings'} />
        </nav>

        <button onClick={() => navigate('/')} className="w-full flex items-center space-x-4 px-6 py-4 text-gray-500 font-bold text-sm bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:bg-slate-50">
           <span>🏠</span>
           <span>Exit Admin</span>
        </button>
      </aside>

      <main className="flex-1 space-y-8 max-w-7xl">
        <Routes>
          <Route path="/" element={
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatsCard label="कुल गाँव" count={props.villages.filter(v=>!v.isDeleted).length} icon="🏘️" color="bg-indigo-50 text-indigo-600" />
                 <StatsCard label="कुल सदस्य" count={props.contacts.filter(c=>!c.isDeleted).length} icon="👥" color="bg-purple-50 text-purple-600" />
                 <StatsCard label="AI इंटरेक्शन" count={aiLogs.length} icon="🤖" color="bg-amber-50 text-amber-600" />
              </div>

              {/* Recent AI Logs Quick View */}
              <div className="card-premium p-8 bg-white border-l-8 border-l-amber-500">
                <h3 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-widest flex items-center">
                  <span className="mr-2">🤖</span> हालिया AI इंटरेक्शन (Real-time)
                </h3>
                <div className="space-y-3">
                  {aiLogs.length > 0 ? aiLogs.map(log => (
                    <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{log.intent} • {log.provider}</p>
                        <p className="text-sm font-bold text-slate-800">Q: "{log.query}"</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">A: {log.response}</p>
                      </div>
                      <div className="text-right shrink-0">
                         <p className="text-[9px] font-bold text-slate-300 uppercase">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )) : <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">कोई इंटरेक्शन डेटा उपलब्ध नहीं है</p>}
                </div>
              </div>

              <div className="card-premium p-10 bg-white">
                 <h3 className="text-sm font-bold text-gray-800 mb-8 uppercase tracking-widest">त्वरित कार्यवाही (Bulk Operations)</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button onClick={() => exportContactsToExcel(props.contacts, props.villages)} className="p-8 bg-emerald-600 text-white rounded-[2rem] font-bold flex flex-col items-center justify-center space-y-3 active:scale-95 transition-all shadow-xl shadow-emerald-100">
                      <span className="text-3xl">📤</span>
                      <p className="text-[12px] uppercase tracking-[0.2em]">Excel Export</p>
                    </button>
                    <label className="p-8 bg-indigo-600 text-white rounded-[2rem] font-bold flex flex-col items-center justify-center space-y-3 active:scale-95 transition-all shadow-xl shadow-indigo-100 cursor-pointer relative overflow-hidden">
                      <span className="text-3xl">📥</span>
                      <p className="text-[12px] uppercase tracking-[0.2em]">{uploadStatus || 'Excel Import'}</p>
                      <input type="file" accept=".xlsx, .xls" onChange={handleExcelImport} className="hidden" disabled={loading} />
                    </label>
                    <button onClick={() => navigate('/register')} className="p-8 bg-slate-900 text-white rounded-[2rem] font-bold flex flex-col items-center justify-center space-y-3 active:scale-95 transition-all shadow-xl">
                      <span className="text-3xl">✨</span>
                      <p className="text-[12px] uppercase tracking-[0.2em]">Add New Member</p>
                    </button>
                 </div>
              </div>
            </div>
          } />

          <Route path="/villages" element={
            <div className="space-y-6">
              <div className="card-premium p-8 bg-white">
                <h3 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-widest">नया गाँव जोड़ें</h3>
                <form onSubmit={handleAddVillage} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input placeholder="गाँव का नाम" className="p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" value={vName} onChange={e=>setVName(e.target.value)} />
                  <input placeholder="तहसील" className="p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold" value={vTehsil} onChange={e=>setVTehsil(e.target.value)} />
                  <button type="submit" disabled={loading} className="bg-black text-white font-bold rounded-2xl text-xs uppercase p-4 shadow-lg active:scale-95">जोड़ें +</button>
                </form>
              </div>
              <div className="card-premium overflow-hidden bg-white">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <tr><th className="px-8 py-5">गाँव</th><th className="px-8 py-5">तहसील</th><th className="px-8 py-5 text-right">कार्यवाही</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {props.villages.filter(v=>!v.isDeleted).map(v => (
                      <tr key={v.id} className="text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5">{v.name}</td>
                        <td className="px-8 py-5">{v.tehsil}</td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={()=>handleDeleteVillage(v.id)} className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold text-[10px] uppercase">हटाएँ</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          } />

          <Route path="/members" element={
            <div className="space-y-6">
              <div className="card-premium p-6 px-8 flex items-center bg-white">
                <span className="mr-4 text-xl">🔍</span>
                <input placeholder="नाम या मोबाइल से खोजें..." className="flex-1 outline-none text-base font-bold" value={mSearch} onChange={e=>setMSearch(e.target.value)} />
              </div>
              <div className="card-premium overflow-x-auto bg-white">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <tr><th className="px-8 py-5">नाम</th><th className="px-8 py-5">पिता/पति</th><th className="px-8 py-5">मोबाइल</th><th className="px-8 py-5 text-right">प्रबंधन</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {props.contacts.filter(c=>!c.isDeleted && (c.name.toLowerCase().includes(mSearch.toLowerCase()) || c.mobile.includes(mSearch))).slice(0, 100).map(c => (
                        <tr key={c.id} className="text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-5 whitespace-nowrap">{c.name}</td>
                          <td className="px-8 py-5 text-gray-500 whitespace-nowrap">{c.fatherName}</td>
                          <td className="px-8 py-5 font-mono text-indigo-600">{c.mobile}</td>
                          <td className="px-8 py-5 text-right">
                            <button onClick={() => handleDeleteMember(c.id)} className="bg-rose-600 text-white px-5 py-2 rounded-xl font-bold text-[10px] uppercase shadow-lg">Delete</button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          } />

          <Route path="/settings" element={
            <div className="space-y-8 pb-12">
              <div className="card-premium p-10 bg-indigo-600 text-white relative overflow-hidden">
                <h3 className="text-sm font-bold text-white mb-8 uppercase tracking-widest">सामाजिक सूचना (Admin Message)</h3>
                <div className="space-y-4">
                  <textarea 
                    className="w-full p-5 bg-white/10 rounded-2xl border border-white/20 text-sm font-bold text-white outline-none focus:bg-white/20"
                    placeholder="जैसे: कल समाज की बैठक साकोदरा में है..."
                    value={props.settings.adminAlertMessage || ''}
                    onChange={e => props.setSettings({...props.settings, adminAlertMessage: e.target.value})}
                  />
                  <p className="text-[9px] text-white/40 italic">खाली छोड़ने पर बॉक्स गायब हो जाएगा।</p>
                </div>
              </div>

              <div className="card-premium p-10 bg-black text-white">
                <h3 className="text-sm font-bold text-white mb-8 uppercase tracking-widest">AI Config (Groq / Gemini)</h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Groq Cloud API Key</label>
                     <input type="password" placeholder="Enter Groq Key..." className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-sm font-bold text-white outline-none" value={props.settings.groqApiKey || ''} onChange={e => props.setSettings({...props.settings, groqApiKey: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">System Master Prompt</label>
                      <textarea className="w-full p-5 bg-white/5 rounded-[2rem] border border-white/10 text-xs font-medium text-white min-h-[140px] outline-none" value={props.settings.aiSystemPrompt || ''} onChange={e => props.setSettings({...props.settings, aiSystemPrompt: e.target.value})} />
                   </div>
                </div>
              </div>

              <div className="card-premium p-10 bg-white">
                <h3 className="text-sm font-bold text-gray-800 mb-8 uppercase tracking-widest">App Branding</h3>
                <UploadBox id="bg-up" label="Background Image" value={props.settings.backgroundImageUrl} onUpload={(e) => {
                  const file = e.target.files?.[0];
                  if(file) uploadFileToStorage(file, 'branding', p => setImgUploadProgress({bg: `${p}%`})).then(url => props.setSettings({...props.settings, backgroundImageUrl: url}));
                }} progress={imgUploadProgress['bg']} onRemove={() => props.setSettings({...props.settings, backgroundImageUrl: ''})} />
              </div>
              <button onClick={handleSaveSettings} disabled={loading} className="w-full bg-black text-white font-bold py-6 rounded-3xl text-[11px] uppercase tracking-[0.3em] shadow-2xl">
                {loading ? 'SAVING...' : 'SAVE ALL SETTINGS TO DATABASE'}
              </button>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;
