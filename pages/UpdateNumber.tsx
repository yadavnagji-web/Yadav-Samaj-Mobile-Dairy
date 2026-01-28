
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, Village, Contact } from '../types';
import { addToCloud } from '../services/firebase';
import { isHindiOnly } from '../utils/validation';

interface UpdateNumberProps {
  villages: Village[];
  settings: AppSettings;
  existingContacts: Contact[];
}

const UpdateNumber: React.FC<UpdateNumberProps> = ({ villages, settings, existingContacts }) => {
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'CHECK' | 'FOUND' | 'REGISTER' | 'OTP'>('CHECK');
  
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [villageId, setVillageId] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timer]);

  const normalizeNumber = (input: string) => {
    let clean = input.replace(/\D/g, '');
    if (clean.length === 10) return `91${clean}`;
    return clean;
  };

  const handleCheck = () => {
    const cleanMob = mobile.replace(/\D/g, '');
    if (cleanMob.length !== 10) return setError('कृपया 10 अंकों का नंबर लिखें');
    
    setLoading(true);
    setError('');
    
    // Check if number already exists
    const existing = existingContacts.find(c => c.mobile.slice(-10) === cleanMob.slice(-10) && !c.isDeleted);
    
    setTimeout(() => {
      setLoading(false);
      if (existing) {
        setStep('FOUND');
      } else {
        setStep('REGISTER');
      }
    }, 600);
  };

  const handleSendOtp = async () => {
    if (!name || !fatherName || !villageId) return setError('सभी जानकारी भरना अनिवार्य है');
    if (!isHindiOnly(name) || !isHindiOnly(fatherName)) return setError('कृपया नाम केवल हिंदी में लिखें');
    
    setLoading(true);
    setError('');
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    
    try {
      const apiKey = settings.whatsappApiKey || '3WHUAVcRdtob3GfQRv9LGlI1V9LU2gMn56ODP799qqwxz0ABSd5j2VTM2fde';
      const msgId = settings.messageId || '11232';
      const phoneId = settings.senderMobile || '823937774143863';
      const targetNum = normalizeNumber(mobile);
      const vars = `${newOtp}|${newOtp}`;
      const url = `https://www.fast2sms.com/dev/whatsapp?authorization=${apiKey}&message_id=${msgId}&phone_number_id=${phoneId}&numbers=${targetNum}&variables_values=${encodeURIComponent(vars)}`;
      
      // Fast2SMS API Call via Proxy
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      await fetch(`${proxyUrl}${encodeURIComponent(url)}`);
      
      setStep('OTP');
      setTimer(300);
    } catch (err: any) {
      setError('OTP भेजने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSave = async () => {
    if (otp !== generatedOtp) {
      return setError('गलत OTP! कृपया पुनः प्रयास करें।');
    }
    
    setLoading(true);
    try {
      const fullMobile = normalizeNumber(mobile);
      await addToCloud('contacts', {
        name, 
        fatherName, 
        mobile: fullMobile, 
        villageId, 
        isDeleted: false, 
        isActive: true,
        profession: 'किसान',
        dynamicValues: {}
      });
      // Device Binding Logic
      localStorage.setItem('bhim_active_number', fullMobile.slice(-10));
      alert("पंजीकरण और नंबर सत्यापन सफल रहा! ✅");
      navigate('/');
    } catch (err) {
      setError('सर्वर एरर! कृपया बाद में प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center p-6 pb-24">
      <header className="w-full max-w-md flex items-center justify-between mb-8">
         <button onClick={() => navigate('/')} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
         </button>
         <h1 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">नंबर अपडेट/पंजीकरण</h1>
      </header>

      <div className="card-premium w-full max-w-md overflow-hidden bg-white shadow-xl">
        <div className="premium-header-gradient p-10 text-white text-center">
           <h2 className="text-xl font-bold uppercase tracking-tight">नंबर सत्यापन</h2>
           <p className="text-[10px] font-medium uppercase tracking-[0.3em] mt-2 opacity-80">BHIM AI Secure System</p>
        </div>

        <div className="p-8 space-y-6">
          {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-bold uppercase text-center border border-rose-100">{error}</div>}

          {step === 'CHECK' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">मोबाइल नंबर दर्ज करें</label>
                <input 
                  type="tel" maxLength={10} placeholder="जैसे: 99821XXXXX" 
                  className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-lg shadow-inner" 
                  value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,''))} 
                />
              </div>
              <button onClick={handleCheck} disabled={loading} className="w-full btn-gradient py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg">
                {loading ? 'जाँच जारी है...' : 'नंबर की जाँच करें'}
              </button>
            </div>
          )}

          {step === 'FOUND' && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-3xl">⚠️</div>
              <h3 className="text-lg font-bold text-slate-800">यह नंबर पहले से पंजीकृत है!</h3>
              <p className="text-xs text-slate-500 font-medium">आप इस नंबर को दोबारा पंजीकृत नहीं कर सकते। यदि यह आपका नंबर है, तो आप इसे सीधे खोज सकते हैं।</p>
              <button onClick={() => navigate('/')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest">होम पर जाएँ</button>
            </div>
          )}

          {step === 'REGISTER' && (
            <div className="space-y-4 animate-slide-up">
              <input className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" placeholder="पूरा नाम (हिंदी में)" value={name} onChange={e => setName(e.target.value)} />
              <input className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" placeholder="पिता/पति का नाम (हिंदी में)" value={fatherName} onChange={e => setFatherName(e.target.value)} />
              <select className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" value={villageId} onChange={e => setVillageId(e.target.value)}>
                <option value="">-- अपना गाँव चुनें --</option>
                {villages.filter(v=>!v.isDeleted).sort((a,b)=>a.name.localeCompare(b.name,'hi')).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <button onClick={handleSendOtp} disabled={loading} className="w-full btn-gradient py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest mt-4">OTP भेजें</button>
            </div>
          )}

          {step === 'OTP' && (
            <div className="space-y-6 text-center animate-slide-up">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">व्हाट्सएप पर प्राप्त कोड दर्ज करें</p>
               <input 
                 type="text" maxLength={6} placeholder="······" 
                 className="w-full text-center p-6 rounded-2xl bg-gray-50 font-bold text-4xl tracking-[0.4em] outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner text-indigo-600" 
                 value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} 
               />
               <button onClick={handleVerifyAndSave} disabled={loading} className="w-full btn-gradient py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px]">सत्यापित करें और सुरक्षित करें</button>
               {timer > 0 ? (
                 <p className="text-[9px] font-bold text-slate-400 uppercase">OTP दोबारा भेजें ({Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')})</p>
               ) : (
                 <button onClick={handleSendOtp} className="text-[10px] font-bold text-indigo-600 uppercase underline">OTP दोबारा भेजें</button>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateNumber;
