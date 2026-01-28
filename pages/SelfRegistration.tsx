
import React, { useState, useEffect, useRef } from 'react';
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
    if (clean.length > 10 && !clean.startsWith('91')) return `91${clean.slice(-10)}`;
    return clean;
  };

  const handleCheck = () => {
    const cleanMob = mobile.replace(/\D/g, '');
    if (cleanMob.length !== 10) return setError('कृपया 10 अंकों का नंबर लिखें');
    
    setLoading(true);
    setError('');
    
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

  const executeSmsRequest = async (targetUrl: string) => {
    const proxies = [
      'https://api.allorigins.win/get?url=',
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
      '' 
    ];

    for (const proxy of proxies) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 20000); 

      try {
        const finalUrl = `${proxy}${encodeURIComponent(targetUrl)}`;
        const response = await fetch(proxy ? finalUrl : targetUrl, { 
          method: 'GET', 
          signal: controller.signal 
        });
        
        clearTimeout(id);

        if (response.ok) {
          const text = await response.text();
          if (text.includes('"return":true') || text.includes('"return": true') || (proxy.includes('allorigins') && text.includes('contents'))) {
            return true;
          }
        }
      } catch (err: any) {
        clearTimeout(id);
      }
    }
    throw new Error("OTP delivery failed");
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
      
      await executeSmsRequest(url);
      setStep('OTP');
      setTimer(300);
    } catch (err: any) {
      setError('WhatsApp गेटवे व्यस्त है। कृपया कुछ समय बाद पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSave = async () => {
    if (otp !== generatedOtp) {
      return setError('गलत कोड! कृपया सही OTP दर्ज करें।');
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
      alert("पंजीकरण सफलतापूर्वक संपन्न हुआ!");
      navigate('/');
    } catch (err) {
      setError('डेटाबेस एरर! पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center p-6 pb-12">
      <div className="w-full max-w-md flex items-center justify-between mb-8">
         <button onClick={() => navigate('/')} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 active:scale-90 transition-all shadow-sm border border-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
         </button>
         <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">BHIM MOBILE DIARY</p>
            <p className="text-sm font-bold text-indigo-600 uppercase">डिजिटल पंजीकरण</p>
         </div>
      </div>

      <div className="card-premium w-full max-w-md overflow-hidden animate-slide-up">
        <div className="premium-header-gradient p-12 text-white text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
           </div>
           <h2 className="text-2xl font-bold uppercase tracking-tight relative z-10">डिजिटल पंजीकरण</h2>
           <p className="text-indigo-100 text-[10px] font-medium uppercase tracking-[0.3em] mt-3 relative z-10">शिक्षा • संगठन • संघर्ष</p>
        </div>

        <div className="p-8 space-y-6">
          {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-bold uppercase text-center border border-rose-100 animate-pulse">{error}</div>}

          {step === 'CHECK' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4 block">मोबाइल नंबर</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-gray-300 text-lg border-r border-gray-100 pr-4 group-focus-within:text-indigo-500 transition-colors">+91</div>
                  <input 
                    type="tel" maxLength={10} placeholder="मोबाइल लिखें" 
                    className="w-full pl-20 pr-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-xl transition-all shadow-inner" 
                    value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,''))} 
                  />
                </div>
              </div>
              <button 
                onClick={handleCheck} disabled={loading}
                className="w-full btn-gradient py-6 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center font-bold uppercase tracking-widest text-sm"
              >
                {loading ? 'प्रक्रिया चल रही है...' : 'पंजीकरण शुरू करें'}
              </button>
            </div>
          )}

          {step === 'REGISTER' && (
            <div className="space-y-4 animate-slide-up">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-4">आपका पूरा नाम (हिंदी)</label>
                <input className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-base border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none shadow-inner" placeholder="जैसे: नगजी यादव" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-4">पिता या पति का नाम (हिंदी)</label>
                <input className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-base border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none shadow-inner" placeholder="जैसे: कवाजी यादव" value={fatherName} onChange={e => setFatherName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-4">अपना गाँव चुनें</label>
                <div className="relative">
                  <select 
                    className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-base outline-none border-2 border-transparent focus:border-indigo-500 appearance-none shadow-inner" 
                    value={villageId} onChange={e => setVillageId(e.target.value)}
                  >
                    <option value="">-- गाँव चुनें --</option>
                    {villages.filter(v=>!v.isDeleted).sort((a,b)=>a.name.localeCompare(b.name,'hi')).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button onClick={() => setStep('CHECK')} className="w-full bg-gray-100 text-gray-500 font-bold py-5 rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">पीछे जाएँ</button>
                <button onClick={handleSendOtp} disabled={loading} className="w-full btn-gradient py-5 rounded-2xl shadow-xl uppercase text-[10px] tracking-widest font-bold">
                  {loading ? 'भेज रहे...' : 'OTP प्राप्त करें'}
                </button>
              </div>
            </div>
          )}

          {step === 'FOUND' && (
            <div className="space-y-8 text-center animate-slide-up">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                 <span className="text-3xl">⚠️</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">आप पहले से पंजीकृत हैं!</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">यह मोबाइल नंबर डेटाबेस में मौजूद है</p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-xl"
              >
                होम स्क्रीन पर जाएँ
              </button>
              <button onClick={() => setStep('CHECK')} className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest underline">दूसरा नंबर उपयोग करें</button>
            </div>
          )}

          {step === 'OTP' && (
            <div className="space-y-10 text-center animate-slide-up">
               <div className="space-y-4">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">व्हाट्सएप पर आया कोड दर्ज करें</p>
                 <input 
                   type="text" maxLength={6} placeholder="······" 
                   className="w-full text-center p-8 rounded-[2.5rem] bg-gray-50 font-bold text-5xl tracking-[0.5em] outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner text-indigo-600" 
                   value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} 
                 />
               </div>
               <button onClick={handleFinalSave} disabled={loading} className="w-full btn-gradient py-6 rounded-[2.25rem] shadow-2xl uppercase tracking-[0.2em] font-bold">पंजीकरण पूर्ण करें</button>
               <button onClick={() => setStep('REGISTER')} className="w-full py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-indigo-500 transition-colors">विवरण बदलें</button>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-12 text-[10px] font-bold text-gray-300 uppercase tracking-[0.5em] text-center">Yadav Samaj Vagad Chaurasi • Secure Directory</p>
    </div>
  );
};

export default SelfRegistration;
