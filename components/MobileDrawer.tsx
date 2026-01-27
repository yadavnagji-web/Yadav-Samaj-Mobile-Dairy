
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl flex flex-col transform transition-transform duration-500 animate-slide-right rounded-r-[3rem]">
        
        <div className="relative p-8 bg-indigo-700 text-white overflow-hidden rounded-tr-[3rem]">
          <div className="relative z-10 flex items-center justify-between mb-4">
            <button onClick={onClose} className="p-2 bg-white/10 rounded-xl">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <h2 className="text-sm font-heavy-custom uppercase tracking-tighter">{UI_STRINGS.shortName}</h2>
          <p className="text-[8px] font-light-custom uppercase tracking-[0.3em] text-white/60 mt-1">Digital Directory</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-3 bg-slate-50/20">
          <DrawerItem icon="✨" label="नया सदस्य पंजीकरण" onClick={() => { navigate('/register'); onClose(); }} highlight={true} />
          <DrawerItem icon="🏘️" label="होम स्क्रीन" onClick={() => { navigate('/'); onClose(); }} />
          <DrawerItem icon="📖" label="उपयोग मार्गदर्शिका" onClick={() => { navigate('/help'); onClose(); }} subLabel="Step-by-Step Guide" />
          
          <div className="h-px bg-slate-100 my-4"></div>

          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-4 mb-2">डाउनलोड एवं प्रिंट</p>
          <DrawerItem icon="🖨️" label="सभी गाँव के QR कोड (PDF)" onClick={() => { window.print(); onClose(); }} subLabel="Direct Access Cards" />
          <DrawerItem icon="📁" label="पूरी समाज डायरी (PDF)" onClick={() => { window.print(); onClose(); }} subLabel="Members + QR" />
          <DrawerItem icon="📊" label="Excel Backup" onClick={() => { exportContactsToExcel(contacts, villages); onClose(); }} />
          
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 mt-6">
            <p className="text-[9px] font-light-custom text-amber-600 uppercase tracking-widest mb-2">SUPPORT HELP</p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">👨‍💻</div>
              <div>
                <p className="text-[11px] font-heavy-custom text-amber-950">नगजी यादव (साकोदरा)</p>
                <a href="tel:9982151938" className="text-[10px] font-light-custom text-amber-600">9982151938</a>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-50">
          {user ? (
            <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm">👤</div>
                 <div>
                   <p className="text-[10px] font-heavy-custom text-indigo-900">Admin</p>
                   <p className="text-[8px] font-light-custom text-slate-400">Panel Active</p>
                 </div>
               </div>
               <button onClick={() => { onLogout(); onClose(); }} className="text-rose-500 p-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m4 4H7" /></svg>
               </button>
            </div>
          ) : (
            <button onClick={() => { navigate('/login'); onClose(); }} className="w-full py-4 bg-slate-900 text-white font-heavy-custom rounded-2xl text-[10px] uppercase tracking-widest shadow-lg">Login Admin</button>
          )}
        </div>
      </div>
    </div>
  );
};

const DrawerItem = ({ icon, label, onClick, subLabel, highlight }: any) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-4 p-3 rounded-2xl transition-all ${highlight ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}>
    <span className={`w-10 h-10 flex items-center justify-center rounded-xl ${highlight ? 'bg-white/20' : 'bg-slate-100'}`}>{icon}</span>
    <div className="text-left">
      <p className="text-[11px] font-heavy-custom leading-tight">{label}</p>
      {subLabel && <p className="text-[8px] font-light-custom uppercase tracking-widest opacity-60">{subLabel}</p>}
    </div>
  </button>
);

export default MobileDrawer;
