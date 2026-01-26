
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  Village, Contact, DynamicField, Bulletin, Banner, 
  AppSettings, User 
} from './types';
import { 
  INITIAL_SETTINGS, UI_STRINGS 
} from './constants';
import { syncCollection } from './services/firebase';

import Navbar from './components/Navbar';
import MobileDrawer from './components/MobileDrawer';
import LaunchingPage from './components/LaunchingPage';
import SmartAssistant from './components/SmartAssistant';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import VillageDetails from './pages/VillageDetails';
import Help from './pages/Help';
import SelfRegistration from './pages/SelfRegistration';

const AppRoutes: React.FC<{
  villages: Village[];
  setVillages: any;
  contacts: Contact[];
  setContacts: any;
  fields: DynamicField[];
  setFields: any;
  bulletins: Bulletin[];
  setBulletins: any;
  banners: Banner[];
  setBanners: any;
  settings: AppSettings;
  setSettings: any;
  currentUser: User | null;
  handleLogin: any;
  handleLogout: any;
  hasPermissionError: boolean;
  hasNetworkError: boolean;
}> = (props) => {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');

  const handleAIAction = (result: any) => {
    switch (result.intent) {
      case 'NAVIGATE_HOME':
        navigate('/');
        setGlobalSearch('');
        break;
      case 'NAVIGATE_VILLAGE':
        if (result.village_name) {
          const village = props.villages.find(v => v.name.includes(result.village_name));
          if (village) navigate(`/village/${village.id}`);
          else alert(`क्षमा करें, "${result.village_name}" नाम का गाँव नहीं मिला।`);
        }
        break;
      case 'SEARCH_CONTACT':
        if (result.search_term) setGlobalSearch(result.search_term);
        break;
      case 'HELP':
        navigate('/help');
        break;
    }
  };

  return (
    <>
      <SmartAssistant onAction={handleAIAction} />
      
      {/* Global Error Banner for Admins */}
      {props.currentUser?.role === 'admin' && (
        <div className="sticky top-14 md:top-16 z-50">
          {props.hasPermissionError && (
            <div className="bg-red-600 text-white text-center py-2 px-4 font-black text-[10px] uppercase tracking-widest animate-pulse border-b border-red-700">
              ⚠️ परमिशन एरर: डेटाबेस रूल्स लॉक हैं। एडमिन पैनल चेक करें।
            </div>
          )}
          {props.hasNetworkError && (
            <div className="bg-amber-500 text-white text-center py-2 px-4 font-black text-[10px] uppercase tracking-widest border-b border-amber-600">
              📡 इंटरनेट धीमा है या डेटाबेस कनेक्ट नहीं हो पा रहा है।
            </div>
          )}
        </div>
      )}

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Routes>
          <Route path="/" element={<Home villages={props.villages} banners={props.banners} externalSearch={globalSearch} setExternalSearch={setGlobalSearch} logoUrl={props.settings.logoUrl} />} />
          <Route path="/village/:id" element={<VillageDetails villages={props.villages} contacts={props.contacts} bulletins={props.bulletins} banners={props.banners} fields={props.fields} externalSearch={globalSearch} setExternalSearch={setGlobalSearch} />} />
          <Route path="/login" element={<Login onLogin={props.handleLogin} settings={props.settings} />} />
          <Route path="/help" element={<Help logoUrl={props.settings.logoUrl} />} />
          <Route path="/register" element={<SelfRegistration villages={props.villages} settings={props.settings} fields={props.fields} existingContacts={props.contacts} />} />
          <Route 
            path="/admin/*" 
            element={
              props.currentUser?.role === 'admin' ? (
                <Admin 
                  villages={props.villages} setVillages={props.setVillages}
                  contacts={props.contacts} setContacts={props.setContacts}
                  fields={props.fields} setFields={props.setFields}
                  bulletins={props.bulletins} setBulletins={props.setBulletins}
                  banners={props.banners} setBanners={props.setBanners}
                  settings={props.settings} setSettings={props.setSettings}
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </main>
    </>
  );
};

const App: React.FC = () => {
  const [showLaunch, setShowLaunch] = useState(true);
  const [villages, setVillages] = useState<Village[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('bhim_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleSyncError = (err: any) => {
      if (err.isPermissionError) setHasPermissionError(true);
      if (err.isNetworkError) setHasNetworkError(true);
    };

    const unsubVillages = syncCollection('villages', setVillages, handleSyncError);
    const unsubContacts = syncCollection('contacts', setContacts, handleSyncError);
    const unsubFields = syncCollection('fields', setFields, handleSyncError);
    const unsubBulletins = syncCollection('bulletins', setBulletins, handleSyncError);
    const unsubBanners = syncCollection('banners', setBanners, handleSyncError);
    const unsubSettings = syncCollection('app_settings', (s) => {
      if (s.length > 0) {
        const global = s.find(item => item.id === 'global');
        if (global) setSettings(global as any);
      }
    }, handleSyncError);

    return () => {
      unsubVillages(); unsubContacts(); unsubFields();
      unsubBulletins(); unsubBanners(); unsubSettings();
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('bhim_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('bhim_user');
  };

  return (
    <HashRouter>
      {showLaunch && <LaunchingPage onComplete={() => setShowLaunch(false)} logoUrl={settings.logoUrl} />}
      
      <div className={`min-h-screen bg-slate-50 pb-24 md:pb-0 pt-14 md:pt-16 transition-all duration-200 ${showLaunch ? 'overflow-hidden max-h-screen' : ''}`}>
        <Navbar 
          user={currentUser} 
          onLogout={handleLogout} 
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          logoUrl={settings.logoUrl}
        />
        
        <MobileDrawer 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          user={currentUser} 
          onLogout={handleLogout}
          logoUrl={settings.logoUrl}
        />
        
        <AppRoutes 
          villages={villages} setVillages={setVillages}
          contacts={contacts} setContacts={setContacts}
          fields={fields} setFields={setFields}
          bulletins={bulletins} setBulletins={setBulletins}
          banners={banners} setBanners={setBanners}
          settings={settings} setSettings={setSettings}
          currentUser={currentUser}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          hasPermissionError={hasPermissionError}
          hasNetworkError={hasNetworkError}
        />

        {/* Global Action Button for Registration */}
        {!showLaunch && (
          <Link 
            to="/register" 
            className="fixed bottom-6 left-6 z-50 bg-green-600 text-white px-6 py-4 rounded-[2rem] font-black shadow-2xl shadow-green-200 flex items-center space-x-3 hover:scale-105 active:scale-95 transition-all md:bottom-10 md:left-10"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z"/></svg>
            <span className="hidden sm:inline">नंबर जोड़ें</span>
          </Link>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 md:hidden z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <Link to="/" className="flex flex-col items-center text-slate-500 hover:text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] mt-1 font-bold">होम</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center text-slate-500 hover:text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            <span className="text-[10px] mt-1 font-bold">मेनू</span>
          </button>
          <Link to="/login" className="flex flex-col items-center text-slate-500 hover:text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px] mt-1 font-bold">लॉगिन</span>
          </Link>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
