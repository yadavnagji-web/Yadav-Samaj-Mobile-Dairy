
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Village, Contact } from '../types';
import { UI_STRINGS } from '../constants';
import { exportContactsToExcel } from '../utils/exportUtils';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  logoUrl: string;
  villages: Village[];
  contacts?: Contact[];
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, user, onLogout, logoUrl, villages, contacts = [] }) => {
  const navigate = useNavigate();
  const [showFullGuide, setShowFullGuide] = useState(false);

  if (!isOpen) return null;

  const toggleGuide = () => setShowFullGuide(!showFullGuide);

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div className="fixed inset-0 bg-indigo-950/50 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      <div className="fixed inset-y-0 left-0 w-[90%] max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-500 animate-slide-right overflow-hidden rounded-r-[4rem]">
        
        {/* Vibrant Header */}
        <div className="relative p-10 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div className="w-16 h-16 bg-white rounded-3xl p-2 shadow-2xl border-2 border-amber-300 transform -rotate-3 flex items-center justify-center">
              <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <button onClick={onClose} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all active:scale-90">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-heavy-custom leading-tight tracking-tight uppercase drop-shadow-md">{UI_STRINGS.shortName}</h2>
            <p className="text-[10px] font-light-custom uppercase tracking-[0.4em] text-white/70 mt-2">समाज उत्थान • डिजिटल क्रांति</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4 bg-slate-50/30">
          <p className="text-[10px] font-light-custom text-slate-400 uppercase tracking-widest ml-4 mb-2">मुख्य विकल्प</p>
          
          <DrawerItem 
            icon="✨" 
            label="नया सदस्य जुड़ें" 
            onClick={() => { navigate('/register'); onClose(); }} 
            subLabel="Self Registration"
            highlight={true}
          />

          <DrawerItem 
            icon="🏘️" 
            label="होम स्क्रीन" 
            onClick={() => { navigate('/'); onClose(); }} 
          />

          <DrawerItem 
            icon="🖨️" 
            label="पूरी PDF डायरी" 
            onClick={() => { window.print(); onClose(); }} 
            subLabel="सभी गाँव + QR कोड"
          />

          <DrawerItem 
            icon="📊" 
            label="Excel डेटा फाइल" 
            onClick={() => { exportContactsToExcel(contacts, villages); onClose(); }} 
            subLabel="Backup Download"
          />

          <div className="h-px bg-slate-200 my-4 mx-4"></div>
          
          {/* Detailed Guide Toggle */}
          <button 
            onClick={toggleGuide}
            className="w-full flex items-center justify-between p-4 bg-indigo-50 rounded-[2rem] border border-indigo-100 hover:bg-indigo-100 transition-all"
          >
            <div className="flex items-center space-x-4">
              <span className="text-xl">📖</span>
              <span className="text-sm font-heavy-custom text-indigo-900">ऐप का उपयोग कैसे करें?</span>
            </div>
            <svg className={`w-5 h-5 text-indigo-400 transition-transform ${showFullGuide ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
          </button>

          {showFullGuide && (
            <div className="p-6 bg-white rounded-[2.5rem] border border-indigo-50 space-y-5 animate-slide-up shadow-sm">
              <GuideStep num="1" title="गाँव का चयन" text="होम स्क्रीन पर ड्रॉपडाउन मेनू से अपना गाँव चुनें। गाँव चुनते ही पूरी सूची सामने आ जाएगी।" />
              <GuideStep num="2" title="स्मार्ट सर्च" text="सर्च बॉक्स में किसी का भी नाम, पिता का नाम या मोबाइल नंबर लिखें। टाइप करते ही रिजल्ट फिल्टर हो जाएंगे।" />
              <GuideStep num="3" title="AI वॉइस सर्च" text="नीचे दिए गए माइक बटन को दबाएँ और 'रामलाल सकदरा' या 'गाँव सकदरा दिखाओ' बोलें। AI अपने आप सर्च कर देगा।" />
              <GuideStep num="4" title="सीधा संपर्क" text="सदस्य के मोबाइल नंबर पर क्लिक करें, आपके फोन का डायलर खुल जाएगा। व्हाट्सएप आइकन से जानकारी साझा करें।" />
              <GuideStep num="5" title="डायरी प्रिंट (PDF)" text="साइडबार में 'पूरी PDF डायरी' पर क्लिक करें। यह पूरी समाज डायरी को QR कोड के साथ प्रिंटिंग के लिए तैयार कर देगा।" />
            </div>
          )}

          {/* Admin Help Info */}
          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] border border-amber-100 mt-6 shadow-sm">
            <p className="text-[10px] font-light-custom text-amber-600 uppercase tracking-widest mb-3">ADMIN HELP / सहायता</p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-amber-100">👨‍💻</div>
              <div>
                <p className="text-sm font-heavy-custom text-amber-950">नगजी यादव (साकोदरा)</p>
                <a href="tel:9982151938" className="text-xs font-light-custom text-amber-600">9982151938</a>
              </div>
            </div>
          </div>
        </div>

        {/* User Status Section */}
        <div className="p-8 bg-white border-t border-slate-100">
          {user ? (
            <div className="flex items-center justify-between bg-indigo-50 p-5 rounded-[2rem] border border-indigo-100">
               <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">👤</div>
                 <div>
                   <p className="text-xs font-heavy-custom text-indigo-900">{user.role === 'admin' ? 'Admin Panel' : 'यूज़र'}</p>
                   <p className="text-[9px] font-light-custom text-slate-400">{user.mobile}</p>
                 </div>
               </div>
               <button onClick={() => { onLogout(); onClose(); }} className="text-rose-500 p-3 hover:bg-rose-50 rounded-2xl transition-all active:scale-90">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               </button>
            </div>
          ) : (
            <button 
              onClick={() => { navigate('/login'); onClose(); }} 
              className="w-full py-6 bg-slate-900 text-white font-heavy-custom rounded-[2.5rem] text-[10px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
            >
              Admin Panel लॉगिन
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-right { animation: slideRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

const DrawerItem = ({ icon, label, onClick, subLabel, highlight }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-5 p-4 rounded-[2.25rem] transition-all active:scale-95 ${highlight ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-white hover:shadow-md'}`}
  >
    <span className={`text-xl ${highlight ? 'bg-white/20' : 'bg-white shadow-sm'} w-14 h-14 flex items-center justify-center rounded-2xl border ${highlight ? 'border-white/20' : 'border-slate-50'}`}>{icon}</span>
    <div className="text-left">
      <p className={`text-sm font-heavy-custom ${highlight ? 'text-white' : 'text-slate-800'}`}>{label}</p>
      {subLabel && <p className={`text-[9px] font-light-custom uppercase tracking-widest ${highlight ? 'text-indigo-100' : 'text-slate-400'}`}>{subLabel}</p>}
    </div>
  </button>
);

const GuideStep = ({ num, title, text }: { num: string; title: string; text: string }) => (
  <div className="flex items-start space-x-4">
    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-heavy-custom text-white shrink-0 shadow-lg border-2 border-white">{num}</div>
    <div>
      <p className="text-xs font-heavy-custom text-indigo-900 leading-none">{title}</p>
      <p className="text-[10px] font-light-custom text-slate-500 mt-1 leading-tight">{text}</p>
    </div>
  </div>
);

export default MobileDrawer;
