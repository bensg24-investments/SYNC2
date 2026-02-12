
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

const Logo: React.FC<{ size?: number; animated?: boolean }> = ({ size = 80, animated = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={animated ? 'animate-pulse' : ''}>
    <defs>
      <linearGradient id="logoGradientApp" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3a5866" />
        <stop offset="100%" stopColor="#e67e5f" />
      </linearGradient>
    </defs>
    <path d="M25 35 A 32 32 0 1 1 75 35" stroke="url(#logoGradientApp)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
    <path d="M75 65 A 32 32 0 1 1 25 65" stroke="url(#logoGradientApp)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
    <path d="M70 30 L 75 35 L 70 40" stroke="url(#logoGradientApp)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M30 70 L 25 65 L 30 60" stroke="url(#logoGradientApp)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M35 55 H 75" stroke="url(#logoGradientApp)" strokeWidth="6" strokeLinecap="round" />
    <path d="M42 55 V 46" stroke="url(#logoGradientApp)" strokeWidth="6" strokeLinecap="round" />
    <path d="M42 46 H 47" stroke="url(#logoGradientApp)" strokeWidth="6" strokeLinecap="round" />
    <path d="M55 55 V 38 C 55 32 63 32 63 38 V 46" stroke="url(#logoGradientApp)" strokeWidth="6" strokeLinecap="round" fill="none" />
  </svg>
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
        <Logo size={100} animated />
        <p className="text-[#1a4a5e] font-bold text-lg mt-4 animate-pulse">Syncing...</p>
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
