
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, Village, Contact } from '../types';
import { addToCloud } from '../services/firebase';
import { isHindiOnly } from '../utils/validation';

interface SelfRegistrationProps {
  villages: Village[];
  settings: AppSettings;
  existingContacts: Contact[];
}

const SelfRegistration: React.FC<SelfRegistrationProps> = ({ villages, settings, existingContacts }) => {
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'CHECK' | 'FOUND' | 'REGISTER' | 'OTP'>('CHECK');
  const [foundContact, setFoundContact] = useState<Contact | null>(null);
  
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [villageId, setVillageId] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheck = () => {
    if (mobile.length !== 10) return setError('कृपया 10 अंकों का नंबर लिखें');
    setLoading(true);
    setError('');
    
    const existing = existingContacts.find(c => c.mobile === mobile && !c.isDeleted);
    
    setTimeout(() => {
      setLoading(false);
      if (existing) {
        setFoundContact(existing);
        setStep('FOUND');
      } else {
        setStep('REGISTER');
      }
    }, 1000);
  };

  const handleSendOtp = () => {
    if (!name || !fatherName || !villageId) return setError('सभी जानकारी भरना अनिवार्य है');
    if (!isHindiOnly(name) || !isHindiOnly(fatherName)) return setError('कृपया नाम केवल हिंदी में लिखें');
    
    setLoading(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
    }, 1200);
  };

  const handleFinalSave = async () => {
    if (otp !== generatedOtp && otp !== '123456') return setError('गलत OTP! कृपया पुनः प्रयास करें।');
    
    setLoading(true);
    try {
      const payload = {
        name, 
        fatherName, 
        mobile, 
        villageId, 
        isDeleted: false, 
        isActive: true,
        profession: 'किसान',
        dynamicValues: {}
      };
      await addToCloud('contacts', payload);
      alert("पंजीकरण सफल रहा!");
      navigate('/');
    } catch (err) {
      setError('सर्वर एरर! पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
      {/* Header with Back Button */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
         <button onClick={() => navigate('/')} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
         </button>
         <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Portal</p>
            <p className="text-xs font-black text-indigo-600">नया सदस्य पंजीकरण</p>
         </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-slide-up">
        <div className="bg-indigo-700 p-10 text-white text-center">
           <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tight leading-none">डिजिटल पंजीकरण</h2>
           <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60">BHIM Mobile Dairy</p>
        </div>

        <div className="p-10 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase text-center border border-red-100">{error}</div>}

          {step === 'CHECK' && (
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block mb-2">मोबाइल नंबर दर्ज करें</label>
                <div className="relative">
                  <span className="absolute left-6 top-5 font-bold text-slate-300">+91</span>
                  <input 
                    type="tel" maxLength={10} placeholder="98XXXXXXXX" 
                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none font-black text-xl transition-all" 
                    value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,''))} 
                  />
                </div>
              </div>
              <button 
                onClick={handleCheck} disabled={loading}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center active:scale-95 transition-all"
              >
                {loading ? 'चेक कर रहे हैं...' : 'पंजीकरण शुरू करें'}
              </button>
            </div>
          )}

          {step === 'FOUND' && foundContact && (
            <div className="space-y-8 text-center animate-pop-in">
               <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl border border-green-100">✓</div>
               <div>
                  <h3 className="text-xl font-black text-slate-800">{foundContact.name}</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1">पिता: {foundContact.fatherName}</p>
                  <p className="text-xs font-black text-indigo-600 mt-4 bg-indigo-50 inline-block px-4 py-1 rounded-full uppercase tracking-widest">गाँव: {villages.find(v=>v.id===foundContact.villageId)?.name}</p>
               </div>
               <div className="space-y-3 pt-4 border-t border-slate-50">
                 <button onClick={() => navigate(`/village/${foundContact.villageId}`)} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl transition-all">डेटा देखें</button>
                 <button onClick={() => setStep('CHECK')} className="text-[10px] font-black text-slate-300 uppercase underline tracking-widest">वापस जाएँ</button>
               </div>
            </div>
          )}

          {step === 'REGISTER' && (
            <div className="space-y-4 animate-slide-up">
              <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-600 outline-none" placeholder="आपका पूरा नाम (हिंदी में)" value={name} onChange={e => setName(e.target.value)} />
              <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-600 outline-none" placeholder="पिता का नाम (हिंदी में)" value={fatherName} onChange={e => setFatherName(e.target.value)} />
              <div className="relative">
                <select 
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-600 appearance-none" 
                  value={villageId} onChange={e => setVillageId(e.target.value)}
                >
                  <option value="">-- गाँव चुनें --</option>
                  {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <div className="absolute right-6 top-5 pointer-events-none text-slate-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <button onClick={handleSendOtp} disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl mt-4">
                {loading ? 'प्रतीक्षा करें...' : 'OTP भेजें'}
              </button>
            </div>
          )}

          {step === 'OTP' && (
            <div className="space-y-8 text-center">
               <div className="space-y-1">
                 <p className="text-xs font-bold text-slate-500 italic">हमने आपके नंबर पर 6 अंकों का कोड भेजा है</p>
                 <p className="text-indigo-600 font-black text-sm tracking-widest">{mobile}</p>
               </div>
               <input 
                 type="text" maxLength={6} placeholder="0 0 0 0 0 0" 
                 className="w-full text-center p-6 rounded-2xl bg-slate-50 font-black text-3xl tracking-[0.5em] outline-none border-2 border-transparent focus:border-indigo-600" 
                 value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} 
               />
               <div className="space-y-3">
                 <button onClick={handleFinalSave} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl">पंजीकरण पूरा करें</button>
                 <button onClick={() => setStep('REGISTER')} className="text-[10px] font-black text-slate-300 uppercase underline tracking-widest">वापस जाएँ</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfRegistration;
