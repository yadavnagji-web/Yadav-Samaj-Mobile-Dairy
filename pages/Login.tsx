
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  settings: AppSettings;
}

const Login: React.FC<LoginProps> = ({ onLogin, settings }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const inputId = id.trim().toLowerCase();
    const inputPass = password.trim();

    const ADMIN_EMAIL = 'yadavnagji@gmail.com';
    const ADMIN_MOBILE = '9982151938';
    const ADMIN_PASS = '123456';

    if ((inputId === ADMIN_EMAIL || inputId === ADMIN_MOBILE) && inputPass === ADMIN_PASS) {
      setLoading(true);
      const adminUser: User = { 
        id: 'admin-session', 
        mobile: 'Admin', 
        role: 'admin' 
      };
      
      setTimeout(() => {
        onLogin(adminUser);
        navigate('/admin');
      }, 800);
    } else {
      setError('गलत आईडी या पासवर्ड! कृपया सही जानकारी भरें।');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[4rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden">
        
        {/* Decorative Background Element */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>

        {/* Home Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-8 left-8 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg transition-all active:scale-90 flex items-center justify-center group"
          title="होम पेज"
        >
           <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </button>

        <div className="text-center mb-12 mt-6 relative z-10">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">
            Admin Panel
          </h2>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mt-3">Elite System Login</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-rose-50 text-rose-600 rounded-[2rem] text-[11px] font-black uppercase text-center border border-rose-100 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="stagger-anim relative z-10 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5 block">ID / Mobile Number</label>
            <div className="relative group">
              <span className="absolute left-6 top-6 text-xl text-indigo-300 transition-colors group-focus-within:text-indigo-600">👤</span>
              <input 
                type="text" 
                placeholder="yadavnagji@gmail.com" 
                className="w-full pl-16 pr-8 py-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-inner" 
                value={id} 
                onChange={e => setId(e.target.value)} 
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5 block">Password</label>
            <div className="relative group">
              <span className="absolute left-6 top-6 text-xl text-indigo-300 transition-colors group-focus-within:text-indigo-600">🔑</span>
              <input 
                type="password" 
                placeholder="••••••" 
                className="w-full pl-16 pr-8 py-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-inner" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-indigo-200 active:scale-95 transition-all mt-6 flex items-center justify-center space-x-3"
          >
            {loading ? (
              <span className="flex items-center space-x-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="uppercase tracking-widest text-xs">Authenticating...</span>
              </span>
            ) : (
              <span className="uppercase tracking-[0.2em] text-xs">Login to Panel</span>
            )}
          </button>
        </form>

        <p className="mt-12 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">नगजी यादव (साकोदरा) • Admin System</p>
      </div>
    </div>
  );
};

export default Login;
