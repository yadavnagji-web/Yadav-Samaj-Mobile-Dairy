
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Village, Contact } from '../types';
import { UI_STRINGS } from '../constants';
import { exportContactsToExcel } from '../utils/exportUtils';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  villages: Village[];
  contacts?: Contact[];
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, user, onLogout, villages, contacts = [] }) => {
  const navigate = useNavigate();

  return (
    <div 
      className={`fixed inset-0 z-[20000] transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div 
        className={`absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      ></div>
      
      <div 
        className={`absolute inset-y-0 left-0 w-80 bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-r-[2.5rem] overflow-hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="relative p-8 premium-header-gradient text-white overflow-hidden rounded-tr-[2.5rem] h-44 flex flex-col justify-end">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 rounded-xl active:scale-90 transition-transform border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <h2 className="text-xl font-bold uppercase tracking-tight leading-none">{UI_STRINGS.shortName}</h2>
          <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-indigo-100 mt-2">डिजिटल ग्राम निर्देशिका</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-3 bg-[#F9FAFB]/50">
          <DrawerItem icon="📲" label="नंबर अपडेट / सत्यापन" onClick={() => { navigate('/update-number'); onClose(); }} highlight={true} />
          <DrawerItem icon="✨" label="नया सदस्य पंजीकरण" onClick={() => { navigate('/register'); onClose(); }} />
          <DrawerItem icon="🗑️" label="अपना नंबर हटाएँ" onClick={() => { navigate('/delete-number'); onClose(); }} />
          <DrawerItem icon="🏠" label="होम स्क्रीन" onClick={() => { navigate('/'); onClose(); }} />
          <DrawerItem icon="📘" label="उपयोग मार्गदर्शिका" onClick={() => { navigate('/help'); onClose(); }} />
          
          <div className="h-px bg-gray-100 my-6 mx-2"></div>

          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-4 mb-3">डाउनलोड एवं प्रिंट</p>
          <DrawerItem icon="🖨️" label="सभी गाँव के QR कोड (PDF)" onClick={() => { window.print(); onClose(); }} />
          <DrawerItem icon="📊" label="Excel Backup" onClick={() => { exportContactsToExcel(contacts, villages); onClose(); }} />
          
          <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 mt-8">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-4">सहयोग हेल्पलाइन</p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-indigo-100">👨‍💻</div>
              <div>
                <p className="text-xs font-bold text-indigo-900">नगजी यादव</p>
                <a href="tel:9982151938" className="text-[10px] font-bold text-indigo-500">9982151938</a>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white">
          {user ? (
            <button onClick={() => { onLogout(); onClose(); }} className="w-full flex items-center justify-center space-x-3 p-4 bg-rose-50 text-rose-600 font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-widest border border-rose-100">
               <span>लॉगआउट करें</span>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m4 4H7" /></svg>
            </button>
          ) : (
            <button onClick={() => { navigate('/login'); onClose(); }} className="w-full py-5 bg-gray-900 text-white font-bold rounded-2xl text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Admin Login</button>
          )}
        </div>
      </div>
    </div>
  );
};

const DrawerItem = ({ icon, label, onClick, highlight }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all active:scale-95 ${highlight ? 'premium-header-gradient text-white shadow-lg shadow-indigo-100' : 'hover:bg-indigo-50/50 text-gray-700'}`}
  >
    <span className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg ${highlight ? 'bg-white/20' : 'bg-white shadow-sm border border-gray-100'}`}>{icon}</span>
    <p className="text-[11px] font-bold tracking-tight">{label}</p>
  </button>
);

export default MobileDrawer;
