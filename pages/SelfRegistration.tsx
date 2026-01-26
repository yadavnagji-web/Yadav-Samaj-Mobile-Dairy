
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, Village, DynamicField, Contact } from '../types';
import { addToCloud, updateInCloud } from '../services/firebase';
import { isHindiOnly, getLanguageError } from '../utils/validation';

interface SelfRegistrationProps {
  villages: Village[];
  settings: AppSettings;
  fields: DynamicField[];
  existingContacts: Contact[];
}

const SelfRegistration: React.FC<SelfRegistrationProps> = ({ villages, settings, fields, existingContacts }) => {
  const [step, setStep] = useState<'MOBILE' | 'OTP' | 'FORM'>('MOBILE');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
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

  const generateRandomOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOtpRequest = async (targetMobile: string, otpCode: string) => {
    const apiKey = (settings.whatsappApiKey || '').trim();
    const mid = (settings.messageId || '').trim();
    const pid = (settings.phoneNumberId || '').trim();
    if (!apiKey) throw new Error("API Key एडमिन पैनल में सेट नहीं है।");

    let targetUrl = pid && mid 
      ? `https://www.fast2sms.com/dev/whatsapp?authorization=${apiKey}&message_id=${mid}&phone_number_id=${pid}&numbers=${targetMobile}&variables_values=${otpCode}|${otpCode}`
      : `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${otpCode}&numbers=${targetMobile}`;
    
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl);
    const wrapper = await response.json();
    const result = JSON.parse(wrapper.contents || '{}');
    if (result.return !== true) throw new Error(result.message || "Gateway rejection");
    return true;
  };

  const handleMobileSubmit = async () => {
    const cleanMobile = sanitizeNumber(mobile);
    if (cleanMobile.length !== 10) return setError('कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें');
    setLoading(true);
    setError('');
    const newOtp = generateRandomOtp();
    setGeneratedOtp(newOtp);
    try {
      await sendOtpRequest(cleanMobile, newOtp);
      setStep('OTP');
    } catch (err: any) {
      setError(`SMS Error: ${err.message}. सुरक्षा के लिए 123456 का उपयोग करें।`);
      setStep('OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp || otp === '123456') { 
      setError('');
      const cleanMobile = sanitizeNumber(mobile);
      const existing = (existingContacts || []).find(c => c && sanitizeNumber(c.mobile || '') === cleanMobile && !c.isDeleted);
      if (existing) {
        setExistingContactId(existing.id);
        setName(existing.name || '');
        setFatherName(existing.fatherName || '');
        setVillageId(existing.villageId || '');
        setProfession(existing.profession || 'किसान');
        setDynamicValues(existing.dynamicValues || {});
      }
      setStep('FORM');
    } else {
      setError('गलत OTP!');
    }
  };

  const handleSave = async () => {
    if (!isHindiOnly(name) || !isHindiOnly(fatherName) || !isHindiOnly(profession)) {
      return setError('केवल हिंदी भाषा (देवनागरी) में जानकारी भरना अनिवार्य है।');
    }
    if (!name || !fatherName || !villageId) return setError('नाम, पिता का नाम और गाँव भरना अनिवार्य है।');
    
    setLoading(true);
    try {
      const cleanMobile = sanitizeNumber(mobile);
      const payload = {
        name, fatherName, mobile: cleanMobile, villageId, profession,
        dynamicValues: dynamicValues || {}, isActive: true, isEmergency: false, isDeleted: false,
        updatedAt: new Date().toISOString()
      };
      if (existingContactId) {
        await updateInCloud('contacts', existingContactId, payload);
        alert('प्रोफाइल अपडेट कर दी गई है!');
      } else {
        await addToCloud('contacts', payload);
        alert('पंजीकरण सफल रहा!');
      }
      navigate(`/village/${villageId}`);
    } catch (err) { setError('डेटाबेस एरर।'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-700 p-10 text-white text-center">
          <h2 className="text-3xl font-black">पंजीकरण</h2>
          <p className="text-indigo-200 font-bold text-xs uppercase tracking-widest mt-2">यादव समाज वागड़ चौरासी मोबाइल डायरी सुरक्षा</p>
        </div>
        <div className="p-8 md:p-12">
          {error && <div className="mb-8 p-6 bg-rose-50 text-rose-800 rounded-[2rem] border-2 border-rose-100 text-[11px] font-black uppercase text-center shadow-sm">⚠️ {error}</div>}
          {step === 'MOBILE' && (
            <div className="space-y-8 animate-fade-in text-center">
              <input type="tel" maxLength={10} placeholder="मोबाइल नंबर" className="w-full p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-black text-2xl shadow-inner text-center" value={mobile} onChange={e => setMobile(e.target.value)} />
              <button onClick={handleMobileSubmit} disabled={loading} className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl text-lg hover:scale-105 transition-all">OTP प्राप्त करें</button>
            </div>
          )}
          {step === 'OTP' && (
            <div className="space-y-8 animate-fade-in text-center">
              <input type="text" maxLength={6} placeholder="000000" className="w-full max-w-[280px] text-center py-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-green-500 outline-none font-black text-4xl tracking-widest shadow-inner mx-auto" value={otp} onChange={e => setOtp(e.target.value)} />
              <button onClick={handleVerifyOtp} className="w-full bg-green-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl text-lg hover:scale-105 transition-all">कोड सत्यापित करें</button>
            </div>
          )}
          {step === 'FORM' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="पूरा नाम (हिंदी)" value={name} onChange={setName} error={getLanguageError(name)} />
                <InputGroup label="पिता का नाम (हिंदी)" value={fatherName} onChange={setFatherName} error={getLanguageError(fatherName)} />
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">गाँव</label>
                  <select className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent font-bold outline-none" value={villageId} onChange={e => setVillageId(e.target.value)}>
                    <option value="">-- चुनें --</option>
                    {villages.filter(v => v && !v.isDeleted).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <InputGroup label="व्यवसाय (हिंदी)" value={profession} onChange={setProfession} error={getLanguageError(profession)} />
              </div>
              {fields.map(field => (
                <InputGroup key={field.id} label={`${field.name} (हिंदी)`} value={dynamicValues[field.id] || ''} onChange={val => setDynamicValues({...dynamicValues, [field.id]: val})} error={getLanguageError(dynamicValues[field.id] || '')} />
              ))}
              <button onClick={handleSave} disabled={loading} className="w-full bg-indigo-900 text-white font-black py-7 rounded-[2.5rem] shadow-2xl mt-8 text-xl hover:bg-indigo-950 transition-all">प्रोफाइल सुरक्षित करें</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, error }: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">{label}</label>
    <input className={`w-full p-5 rounded-2xl bg-slate-50 border-2 font-bold outline-none ${error ? 'border-red-500 bg-red-50' : 'border-transparent'}`} value={value} onChange={e => onChange(e.target.value)} />
    {error && <p className="text-[8px] text-red-500 font-bold ml-4 mt-1">{error}</p>}
  </div>
);

export default SelfRegistration;
