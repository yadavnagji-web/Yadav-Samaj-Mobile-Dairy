
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  settings: AppSettings;
}

const Login: React.FC<LoginProps> = ({ onLogin, settings }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sanitizeNumber = (num: string) => {
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.substring(2);
    if (cleaned.length > 10) cleaned = cleaned.slice(-10);
    return cleaned;
  };

  const handleUserLogin = () => {
    const cleanMobile = sanitizeNumber(mobile);
    if (cleanMobile.length !== 10) {
      return setError('कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें');
    }
    
    setLoading(true);
    setTimeout(() => {
      onLogin({ id: 'u' + Date.now(), mobile: cleanMobile, role: 'user' });
      navigate('/');
      setLoading(false);
    }, 500);
  };

  const handleAdminLogin = () => {
    if ((mobile === 'yadavnagji@gmail.com' || mobile === '9982151938') && password === '123456') {
      onLogin({ id: 'admin', mobile: 'Admin', role: 'admin' });
      navigate('/admin');
    } else {
      setError('गलत एडमिन आईडी या पासवर्ड!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-4 animate-fade-in">
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="w-24 h-24 bg-white rounded-full overflow-hidden flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-amber-400 p-1">
            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-black text-indigo-900 tracking-tight">लॉगिन करें</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">यादव समाज वागड़ चौरासी मोबाइल डायरी</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 relative z-10">
          <button onClick={() => { setIsAdminMode(false); setError(''); }} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${!isAdminMode ? 'bg-indigo-700 text-white shadow-lg' : 'text-slate-400'}`}>यूजर</button>
          <button onClick={() => { setIsAdminMode(true); setError(''); }} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${isAdminMode ? 'bg-indigo-700 text-white shadow-lg' : 'text-slate-400'}`}>एडमिन</button>
        </div>

        {error && (
          <div className="text-red-600 text-[11px] mb-6 text-center font-black uppercase bg-red-50 p-5 rounded-3xl border border-red-100 animate-pulse leading-relaxed shadow-inner">
            {error}
          </div>
        )}

        <div className="relative z-10">
          {!isAdminMode ? (
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 block mb-2">मोबाइल नंबर</label>
                <div className="relative">
                  <span className="absolute left-5 top-4.5 font-bold text-slate-400">+91</span>
                  <input 
                    type="tel" 
                    placeholder="9876543210" 
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" 
                    value={mobile} 
                    onChange={e => setMobile(e.target.value)} 
                  />
                </div>
              </div>
              <button 
                onClick={handleUserLogin} 
                disabled={loading}
                className={`w-full bg-green-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-100 active:scale-95 transition-all flex items-center justify-center group ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? 'लॉगिन हो रहा है...' : 'डायरेक्ट लॉगिन'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 block mb-2">एडमिन आईडी</label>
                <input type="text" placeholder="yadavnagji@gmail.com" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={mobile} onChange={e => setMobile(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 block mb-2">पासवर्ड</label>
                <input type="password" placeholder="******" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button onClick={handleAdminLogin} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all">एडमिन लॉगिन</button>
            </div>
          )}
        </div>
      </div>
      <p className="text-center mt-8 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">© 2026 यादव समाज वागड़ चौरासी मोबाइल डायरी</p>
    </div>
  );
};

export default Login;
