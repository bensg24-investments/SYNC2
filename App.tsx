
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LayoutGrid, ScanText, BookText, Gift, Loader2 } from 'lucide-react';
import HomePage from './pages/Home';
import ProfilePage from './pages/Profile';
import ClassesPage from './pages/Classes';
import StudyPage from './pages/Study';
import ScanPage from './pages/Scan';
import RedeemPage from './pages/Redeem';
import SettingsPage from './pages/Settings';
import AuthPage from './pages/Auth';
import { useApp } from './AppContext';

const Logo: React.FC<{ size?: number; animated?: boolean; withBackground?: boolean }> = ({ size = 80, animated = false, withBackground = false }) => (
  <div className={`relative flex items-center justify-center ${withBackground ? 'rounded-[32px] overflow-hidden p-2 bg-gradient-to-br from-[#2c4a5e] via-[#4d6a7e] to-[#e67e5f] shadow-2xl' : ''}`} style={{ width: size, height: size }}>
    <svg width="85%" height="85%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${animated ? 'animate-pulse' : ''} drop-shadow-sm`}>
      {/* Sync Arrows - Sharpened */}
      <path d="M25 45 A 25 25 0 0 1 75 45" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M75 55 A 25 25 0 0 1 25 55" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
      
      {/* Arrow Heads */}
      <path d="M71 39 L 75 45 L 69 47" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M29 61 L 25 55 L 31 53" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      {/* Sink/Tap Icon */}
      <path d="M35 55 H 70" stroke="white" strokeWidth="7" strokeLinecap="round" />
      <path d="M42 55 V 48 H 47" stroke="white" strokeWidth="7" strokeLinecap="round" />
      <path d="M55 55 V 42 C 55 35 65 35 65 42 V 48" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-3 flex justify-around items-center z-50 rounded-t-[32px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <Link to="/" className={`flex flex-col items-center gap-1 transition-all ${isActive('/') ? 'text-[#e67e5f]' : 'text-slate-400 opacity-60'}`}>
        <div className={`p-2 rounded-xl transition-colors ${isActive('/') ? 'bg-[#e67e5f]/10' : ''}`}>
          <LayoutGrid size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
        </div>
        <span className="text-[10px] font-bold">Home</span>
      </Link>
      <Link to="/scan" className={`flex flex-col items-center gap-1 transition-all ${isActive('/scan') ? 'text-[#e67e5f]' : 'text-slate-400 opacity-60'}`}>
        <div className={`p-2 rounded-xl transition-colors ${isActive('/scan') ? 'bg-[#e67e5f]/10' : ''}`}>
          <ScanText size={24} strokeWidth={isActive('/scan') ? 2.5 : 2} />
        </div>
        <span className="text-[10px] font-bold">Scan</span>
      </Link>
      <Link to="/study" className={`flex flex-col items-center gap-1 transition-all ${isActive('/study') ? 'text-[#e67e5f]' : 'text-slate-400 opacity-60'}`}>
        <div className={`p-2 rounded-xl transition-colors ${isActive('/study') ? 'bg-[#e67e5f]/10' : ''}`}>
          <BookText size={24} strokeWidth={isActive('/study') ? 2.5 : 2} />
        </div>
        <span className="text-[10px] font-bold">Study</span>
      </Link>
      <Link to="/redeem" className={`flex flex-col items-center gap-1 transition-all ${isActive('/redeem') ? 'text-[#e67e5f]' : 'text-slate-400 opacity-60'}`}>
        <div className={`p-2 rounded-xl transition-colors ${isActive('/redeem') ? 'bg-[#e67e5f]/10' : ''}`}>
          <Gift size={24} strokeWidth={isActive('/redeem') ? 2.5 : 2} />
        </div>
        <span className="text-[10px] font-bold">Redeem</span>
      </Link>
    </nav>
  );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useApp();
  
  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-8 text-center">
        <Logo size={120} animated withBackground />
        <p className="text-[#1a4a5e] font-bold text-lg mt-8 animate-pulse">Syncing...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f8f9fa] relative overflow-x-hidden shadow-2xl shadow-slate-200 pb-24 font-sans text-[#1a4a5e]">
      <div className="min-h-screen">
        {children}
      </div>
      <Navigation />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/redeem" element={<RedeemPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
