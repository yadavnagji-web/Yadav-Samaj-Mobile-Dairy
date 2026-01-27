
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { UI_STRINGS } from '../constants';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenMobileMenu?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenMobileMenu }) => {
  const location = useLocation();
  // Don't show generic Navbar on Home Page to preserve the aesthetic
  if (location.pathname === '/') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-md text-white shadow-xl z-40 h-14 flex items-center px-4 justify-between border-b border-white/10">
      <Link to="/" className="flex items-center space-x-2">
        <span className="font-black text-xs uppercase tracking-widest">{UI_STRINGS.appName}</span>
      </Link>
      <div className="flex items-center space-x-3">
        {user ? (
          <button onClick={onLogout} className="bg-red-500 text-white px-4 py-1 rounded-lg text-[10px] font-black uppercase">Logout</button>
        ) : (
          <Link to="/login" className="bg-white text-indigo-900 px-4 py-1 rounded-lg text-[10px] font-black uppercase">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
