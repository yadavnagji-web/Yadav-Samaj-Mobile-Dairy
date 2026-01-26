
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, Village, DynamicField, Contact } from '../types';
import { addToCloud, updateInCloud } from '../services/firebase';

interface SelfRegistrationProps {
  villages: Village[];
  settings: AppSettings;
  fields: DynamicField[];
  existingContacts: Contact[];
}

const SelfRegistration: React.FC<SelfRegistrationProps> = ({ villages, settings, fields, existingContacts }) => {
  const [step, setStep] = useState<'MOBILE' | 'OTP' | 'FORM'>('MOBILE');
  const [mobile, setMobile] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState('');
  const [villageId, setVillageId] = useState('');
  const [profession, setProfession] = useState('किसान');
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});
  const [existingContactId, setExistingContactId] = useState<string | null>(null);

  const sanitizeNumber = (num: string) => {
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.substring(2);
    if (cleaned.length > 10) cleaned = cleaned.slice(-10);
    return cleaned;
  };

  const handleSendOtp = async () => {
    const cleanMobile = sanitizeNumber(mobile);
    if (cleanMobile.length !== 10) return setError('कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें');
    
    setLoading(true);
    setError('');
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);

    const apiUrl = 'https://www.fast2sms.com/dev/bulkV2';
    const proxyUrl = 'https://corsproxy.io/?';
    const finalUrl = `${proxyUrl}${encodeURIComponent(apiUrl)}`;

    try {
      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'authorization': settings.whatsappApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "route": "dlt",
          "sender_id": settings.messageId || "11232",
          "message": settings.templateId,
          "variables_values": newOtp,
          "numbers": cleanMobile,
        })
      });

      const data = await response.json();

      if (data.return) {
        setStep('OTP');
      } else {
        setStep('OTP');
        setError(`नोट: ${data.message || 'OTP भेजा गया'}। टेस्ट कोड: *${newOtp}*`);
      }
    } catch (err) {
      setError(`डेमो मोड सक्रिय। टेस्ट कोड: *${newOtp}*`);
      setStep('OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (userEnteredOtp === generatedOtp) {
      const cleanMobile = sanitizeNumber(mobile);
      const existing = existingContacts.find(c => sanitizeNumber(c.mobile) === cleanMobile && !c.isDeleted);
      if (existing) {
        setExistingContactId(existing.id);
        setName(existing.name);
        setVillageId(existing.villageId);
        setProfession(existing.profession);
        setDynamicValues(existing.dynamicValues || {});
      }
      setStep('FORM');
      setError('');
    } else {
      setError('गलत OTP! कृपया दोबारा जांचें।');
    }
  };

  const handleSave = async () => {
    if (!name || !villageId) return setError('कृपया नाम और गाँव भरें।');
    setLoading(true);
    try {
      const cleanMobile = sanitizeNumber(mobile);
      const payload = {
        name,
        mobile: cleanMobile,
        villageId,
        profession,
        dynamicValues,
        isActive: true,
        isEmergency: false,
        isDeleted: false,
        updatedAt: new Date().toISOString()
      };

      if (existingContactId) {
        await updateInCloud('contacts', existingContactId, payload);
        alert('जानकारी सफलतापूर्वक अपडेट कर दी गई है!');
      } else {
        await addToCloud('contacts', payload);
        alert('आपका नंबर सफलतापूर्वक जोड़ दिया गया है!');
      }
      navigate(`/village/${villageId}`);
    } catch (err) {
      setError('सुरक्षित करने में त्रुटि आई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-700 p-8 text-white text-center">
          <h2 className="text-3xl font-black tracking-tight">नंबर जोड़ें / अपडेट करें</h2>
          <p className="text-indigo-200 font-bold text-xs uppercase tracking-widest mt-2">BHIM Mobile Dairy</p>
        </div>

        <div className="p-8 md:p-12">
          {error && (
            <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-[10px] font-black uppercase text-center animate-pulse leading-relaxed shadow-inner">
              {error}
            </div>
          )}

          {step === 'MOBILE' && (
            <div className="space-y-6">
              <p className="text-slate-500 font-bold text-center leading-relaxed">
                अपना व्हाट्सएप मोबाइल नंबर दर्ज करें।
              </p>
              <div className="relative">
                <span className="absolute left-6 top-5 font-black text-slate-400 text-lg">+91</span>
                <input 
                  type="tel" 
                  placeholder="मोबाइल नंबर लिखें" 
                  className="w-full pl-16 pr-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-black text-xl" 
                  value={mobile} 
                  onChange={e => setMobile(e.target.value)} 
                />
              </div>
              <button 
                onClick={handleSendOtp} 
                disabled={loading}
                className="w-full bg-green-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
              >
                <span>{loading ? 'भेज रहे हैं...' : 'OTP प्राप्त करें'}</span>
              </button>
            </div>
          )}

          {step === 'OTP' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">OTP कोड दर्ज करें</p>
              <input 
                type="number" 
                placeholder="0000" 
                className="w-full text-center text-5xl font-black py-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none tracking-[0.5em]" 
                value={userEnteredOtp} 
                onChange={e => setUserEnteredOtp(e.target.value)} 
                autoFocus
              />
              <button 
                onClick={handleVerifyOtp} 
                className="w-full bg-indigo-700 text-white font-black py-5 rounded-[2rem] shadow-2xl active:scale-95 transition-all"
              >
                वेरिफाई करें
              </button>
              <button onClick={() => { setStep('MOBILE'); setError(''); }} className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 mt-4">नंबर सुधारें</button>
            </div>
          )}

          {step === 'FORM' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-2xl mb-4 border border-indigo-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm font-black text-xs">OK</div>
                <div>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">नंबर वेरिफाइड</p>
                   <p className="font-black text-indigo-900">{sanitizeNumber(mobile)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">पूरा नाम</label>
                <input placeholder="उदा. नागजी यादव" className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 font-bold outline-none" value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">गाँव चुनें</label>
                <select className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 font-bold outline-none appearance-none" value={villageId} onChange={e => setVillageId(e.target.value)}>
                  <option value="">-- गाँव चुनें --</option>
                  {villages.filter(v => !v.isDeleted).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">व्यवसाय</label>
                <input placeholder="उदा. किसान, शिक्षक, व्यापारी" className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 font-bold outline-none" value={profession} onChange={e => setProfession(e.target.value)} />
              </div>

              {fields.map(field => (
                <div key={field.id} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">{field.name}</label>
                  <input 
                    placeholder={`${field.name} लिखें`}
                    className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 font-bold outline-none" 
                    value={dynamicValues[field.id] || ''} 
                    onChange={e => setDynamicValues({...dynamicValues, [field.id]: e.target.value})} 
                  />
                </div>
              ))}

              <button 
                onClick={handleSave} 
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-indigo-900 active:scale-95 transition-all mt-6"
              >
                {loading ? 'सुरक्षित हो रहा है...' : existingContactId ? 'जानकारी अपडेट करें' : 'नंबर सुरक्षित करें'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfRegistration;
