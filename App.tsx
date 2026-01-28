
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  Village, Contact, DynamicField, Bulletin, Banner, 
  AppSettings, User 
} from './types';
import { 
  INITIAL_SETTINGS 
} from './constants';
import { syncCollection } from './services/firebase';

import SmartAssistant from './components/SmartAssistant';
import FullPrintView from './components/FullPrintView';
import VillageQRPrintView from './components/VillageQRPrintView';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import VillageDetails from './pages/VillageDetails';
import Help from './pages/Help';
import SelfRegistration from './pages/SelfRegistration';
import UpdateNumber from './pages/UpdateNumber';
import DeleteNumber from './pages/DeleteNumber';

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
        }
        break;
      case 'HELP':
        navigate('/help');
        break;
    }
  };

  const bgStyle: React.CSSProperties = props.settings.backgroundImageUrl ? {
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.85)), url(${props.settings.backgroundImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  } : {
    backgroundColor: '#f8fafc'
  };

  return (
    <div style={bgStyle} className="min-h-screen transition-all duration-700">
      <SmartAssistant onAction={handleAIAction} />
      
      <div className="print-container hidden print:block">
        <FullPrintView contacts={props.contacts} villages={props.villages} />
        <VillageQRPrintView villages={props.villages} />
      </div>
      
      <main className="w-full min-h-screen print:hidden relative z-10">
        <Routes>
          <Route path="/" element={<Home villages={props.villages} contacts={props.contacts} settings={props.settings} user={props.currentUser} onLogout={props.handleLogout} />} />
          <Route path="/village/:id" element={<VillageDetails villages={props.villages} contacts={props.contacts} bulletins={props.bulletins} banners={props.banners} fields={props.fields} externalSearch={globalSearch} setExternalSearch={setGlobalSearch} />} />
          <Route path="/login" element={<Login onLogin={props.handleLogin} settings={props.settings} />} />
          <Route path="/help" element={<Help />} />
          <Route path="/register" element={<SelfRegistration villages={props.villages} settings={props.settings} existingContacts={props.contacts} />} />
          <Route path="/update-number" element={<UpdateNumber villages={props.villages} settings={props.settings} existingContacts={props.contacts} />} />
          <Route path="/delete-number" element={<DeleteNumber settings={props.settings} existingContacts={props.contacts} />} />
          
          <Route 
            path="/admin/*" 
            element={
              props.currentUser && props.currentUser.role === 'admin' ? (
                <Admin 
                  villages={props.villages} setVillages={props.setVillages}
                  contacts={props.contacts} setContacts={props.setContacts}
                  settings={props.settings} setSettings={props.setSettings}
                  onLogout={props.handleLogout}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [villages, setVillages] = useState<Village[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('bhim_user');
    if (!saved) return null;
    try { return JSON.parse(saved); } catch { return null; }
  });

  useEffect(() => {
    const unsubVillages = syncCollection('villages', setVillages);
    const unsubContacts = syncCollection('contacts', setContacts);
    const unsubFields = syncCollection('fields', setFields);
    const unsubBulletins = syncCollection('bulletins', setBulletins);
    const unsubBanners = syncCollection('banners', setBanners);
    const unsubSettings = syncCollection('app_settings', (s) => {
      if (s.length > 0) {
        const global = s.find(item => item.id === 'global');
        if (global) setSettings(global as any);
      }
    });

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
      />
    </HashRouter>
  );
};

export default App;
