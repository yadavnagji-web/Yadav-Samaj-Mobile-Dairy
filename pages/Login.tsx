
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  settings: AppSettings;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Default Credentials based on prompt
    const ADMIN_EMAIL = 'yadavnagji@gmail.com';
    const ADMIN_PASS = '123456';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      setLoading(true);
      setTimeout(() => {
        onLogin({ id: 'admin-session', mobile: '9982151938', role: 'admin' });
        navigate('/admin');
      }, 800);
    } else {
      setError('गलत ईमेल या पासवर्ड! कृपया पुनः प्रयास करें।');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[4rem] p-12 shadow-2xl border border-white relative overflow-hidden">
        
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 p-3 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        <div className="text-center mb-10 mt-6">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Admin Portal</h2>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mt-3">Secure Access</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase text-center border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="email" placeholder="Email Address" 
            className="w-full p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-slate-700 shadow-inner" 
            value={email} onChange={e => setEmail(e.target.value)} required
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-slate-700 shadow-inner" 
            value={password} onChange={e => setPassword(e.target.value)} required
          />
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-xl active:scale-95 transition-all">
            {loading ? 'Authenticating...' : 'लॉगिन करें'}
          </button>
        </form>

        <p className="mt-12 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Nagji Yadav • BHIM Secure System</p>
      </div>
    </div>
  );
};

export default Login;
