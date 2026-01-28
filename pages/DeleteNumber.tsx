
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, Village, Contact } from '../types';
import { db } from '../services/firebase';
import { ref, remove } from 'firebase/database';

interface DeleteNumberProps {
  settings: AppSettings;
  existingContacts: Contact[];
}

const DeleteNumber: React.FC<DeleteNumberProps> = ({ settings, existingContacts }) => {
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'INPUT' | 'OTP' | 'SUCCESS'>('INPUT');
  const [targetContact, setTargetContact] = useState<Contact | null>(null);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ownershipError, setOwnershipError] = useState('');
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

  const handleStartDelete = async () => {
    const cleanMob = mobile.replace(/\D/g, '');
    if (cleanMob.length !== 10) return setError('कृपया 10 अंकों का नंबर लिखें');
    
    setLoading(true);
    setError('');
    setOwnershipError('');
    
    // Check Ownership Logic (Simulated via localStorage)
    const storedNum = localStorage.getItem('bhim_active_number');
    if (storedNum !== cleanMob) {
      setLoading(false);
      return setOwnershipError("आप इस नंबर के मालिक नहीं हैं। कृपया उसी मोबाइल से नंबर डिलीट करें जिसमें यह मोबाइल नंबर अभी चालू है। अन्यथा अपडेट पेज पर जाकर अपना नंबर अपडेट करें।");
    }

    // Find member in DB
    const contact = existingContacts.find(c => c.mobile.slice(-10) === cleanMob.slice(-10) && !c.isDeleted);
    
    if (!contact) {
      setLoading(false);
      return setError('यह नंबर डेटाबेस में नहीं मिला।');
    }

    setTargetContact(contact);
    
    // Send OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    
    try {
      const apiKey = settings.whatsappApiKey || '3WHUAVcRdtob3GfQRv9LGlI1V9LU2gMn56ODP799qqwxz0ABSd5j2VTM2fde';
      const msgId = settings.messageId || '11232';
      const phoneId = settings.senderMobile || '823937774143863';
      const targetNum = normalizeNumber(mobile);
      const vars = `${newOtp}|${newOtp}`;
      const url = `https://www.fast2sms.com/dev/whatsapp?authorization=${apiKey}&message_id=${msgId}&phone_number_id=${phoneId}&numbers=${targetNum}&variables_values=${encodeURIComponent(vars)}`;
      
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      await fetch(`${proxyUrl}${encodeURIComponent(url)}`);
      
      setStep('OTP');
      setTimer(300);
    } catch (err) {
      setError('OTP भेजने में विफलता। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (otp !== generatedOtp) {
      return setError('गलत OTP! कृपया पुनः प्रयास करें।');
    }
    
    if (!targetContact) return;

    setLoading(true);
    try {
      const memberRef = ref(db, `contacts/${targetContact.id}`);
      await remove(memberRef);
      // Clear ownership after deletion
      localStorage.removeItem('bhim_active_number');
      setStep('SUCCESS');
    } catch (err) {
      setError('त्रुटि! डेटाबेस से संपर्क नहीं हो पाया।');
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
         <h1 className="text-sm font-bold text-rose-600 uppercase tracking-widest">नंबर हटाएँ</h1>
      </header>

      <div className="card-premium w-full max-w-md overflow-hidden bg-white shadow-xl">
        <div className="p-10 bg-rose-600 text-white text-center">
           <h2 className="text-xl font-bold uppercase tracking-tight">डेटा हटाना</h2>
           <p className="text-[10px] font-medium uppercase tracking-[0.3em] mt-2 opacity-80">Permanent Removal System</p>
        </div>

        <div className="p-8 space-y-6">
          {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-bold uppercase text-center border border-rose-100">{error}</div>}
          
          {ownershipError && (
            <div className="p-6 bg-amber-50 text-amber-800 rounded-3xl text-[11px] font-bold leading-relaxed border border-amber-100 animate-fade-in shadow-inner">
              <div className="flex items-center space-x-3 mb-3">
                 <span className="text-xl">⚠️</span>
                 <p className="uppercase tracking-widest">सुरक्षा चेतावनी</p>
              </div>
              {ownershipError}
            </div>
          )}

          {step === 'INPUT' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">हटाने के लिए मोबाइल नंबर</label>
                <input 
                  type="tel" maxLength={10} placeholder="मोबाइल नंबर लिखें" 
                  className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-rose-500 outline-none font-bold text-lg shadow-inner" 
                  value={mobile} onChange={e => {
                    setMobile(e.target.value.replace(/\D/g,''));
                    setOwnershipError('');
                  }} 
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium text-center italic">नोट: सुरक्षा कारणों से नंबर केवल उसी मोबाइल से हटेगा जिससे वह पंजीकृत हुआ है।</p>
              <button 
                onClick={handleStartDelete} 
                disabled={loading || (mobile.length !== 10 && !ownershipError)} 
                className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all ${ownershipError ? 'bg-gray-200 text-gray-400' : 'bg-rose-600 text-white'}`}
              >
                {loading ? 'प्रोसेसिंग...' : 'OTP प्राप्त करें'}
              </button>
            </div>
          )}

          {step === 'OTP' && (
            <div className="space-y-6 text-center animate-slide-up">
               <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">नाम</p>
                  <p className="font-bold text-slate-800">{targetContact?.name}</p>
               </div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">सत्यापन कोड दर्ज करें</p>
               <input 
                 type="text" maxLength={6} placeholder="······" 
                 className="w-full text-center p-6 rounded-2xl bg-gray-50 font-bold text-4xl tracking-[0.4em] outline-none border-2 border-transparent focus:border-rose-500 shadow-inner text-rose-600" 
                 value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} 
               />
               <button onClick={handleConfirmDelete} disabled={loading} className="w-full bg-rose-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl">सदस्यता स्थायी रूप से हटाएँ</button>
               {timer > 0 ? (
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Resend in ({Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')})</p>
               ) : (
                 <button onClick={handleStartDelete} className="text-[10px] font-bold text-rose-600 uppercase underline">OTP दोबारा भेजें</button>
               )}
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center space-y-6 animate-fade-in py-10">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
              <h3 className="text-lg font-bold text-slate-800">नंबर सफलतापूर्वक हटा दिया गया!</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">आपका विवरण अब डिजिटल मोबाइल डायरी से हटा दिया गया है।</p>
              <button onClick={() => navigate('/')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest">होम पर जाएँ</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteNumber;
