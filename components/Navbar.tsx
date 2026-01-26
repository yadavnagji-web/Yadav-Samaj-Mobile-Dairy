
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { UI_STRINGS } from '../constants';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenMobileMenu?: () => void;
  logoUrl: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenMobileMenu, logoUrl }) => {
  const shareApp = async () => {
    const shareData = {
      title: 'BHIM Mobile Dairy',
      text: 'BHIM Mobile Dairy: ग्राम निर्देशिका एवं सामाजिक डायरी। अभी देखें:',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`, '_blank');
      }
    } catch (err) { console.error('Share failed:', err); }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-indigo-700 text-white shadow-xl z-40 hidden md:block">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full overflow-hidden border-2 border-amber-400">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black tracking-tight">{UI_STRINGS.appName}</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/" className="font-bold hover:text-amber-300 transition-colors">होम</Link>
            {user?.role === 'admin' && <Link to="/admin" className="font-bold hover:text-amber-300 transition-colors">एडमिन</Link>}
            <button onClick={shareApp} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all font-bold text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316" /></svg>
              <span>शेयर करें</span>
            </button>
            {user ? (
              <button onClick={onLogout} className="bg-amber-500 text-indigo-900 px-5 py-2 rounded-xl text-sm font-black hover:bg-amber-400 transition-all">लॉगआउट</button>
            ) : (
              <Link to="/login" className="bg-white text-indigo-700 px-6 py-2 rounded-xl text-sm font-black hover:bg-amber-50 transition-all">लॉगिन</Link>
            )}
          </div>
        </div>
      </nav>

      <nav className="fixed top-0 left-0 right-0 bg-indigo-700 text-white shadow-lg z-40 md:hidden h-14 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onOpenMobileMenu} className="p-2 hover:bg-white/10 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg></button>
          <span className="font-black">{UI_STRINGS.appName}</span>
        </div>
        <div className="w-9 h-9 bg-white rounded-full overflow-hidden border-2 border-amber-400">
           <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
