
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { UI_STRINGS } from '../constants';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  logoUrl: string;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, user, onLogout, logoUrl }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col transform transition-transform duration-300">
        <div className="p-6 bg-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden border-2 border-amber-400">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-black text-lg leading-tight">{UI_STRINGS.appName}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">डिजिटल निर्देशिका</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-indigo-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <DrawerItem to="/" label="होम पेज" icon="M3 12l2-2m0 0l7-7 7 7" onClick={onClose} />
          <DrawerItem to="/help" label="उपयोग कैसे करें?" icon="M13 16h-1v-4h-1" onClick={onClose} />
          {user?.role === 'admin' && <DrawerItem to="/admin" label="एडमिन डैशबोर्ड" icon="M9 19v-6" onClick={onClose} />}
        </div>
        <div className="p-6 border-t border-slate-100">
          {user ? (
            <button onClick={() => { onLogout(); onClose(); }} className="w-full bg-red-50 text-red-600 font-black py-4 rounded-2xl flex items-center justify-center space-x-2">लॉगआउट</button>
          ) : (
            <Link to="/login" onClick={onClose} className="w-full bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">लॉगिन</Link>
          )}
        </div>
      </div>
    </div>
  );
};

const DrawerItem = ({ to, label, icon, onClick }: any) => (
  <Link to={to} onClick={onClick} className="flex items-center space-x-4 px-6 py-4 rounded-2xl text-slate-700 font-black hover:bg-indigo-50 hover:text-indigo-700 transition-all">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
    <span>{label}</span>
  </Link>
);

export default MobileDrawer;
