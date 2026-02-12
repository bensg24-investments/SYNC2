
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AtSign } from 'lucide-react';

const Logo: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <div className="relative flex items-center justify-center rounded-[40px] overflow-hidden p-2 bg-gradient-to-br from-[#3a5866] via-[#5b7a8a] to-[#e67e5f] shadow-2xl" style={{ width: size, height: size }}>
    <svg width="85%" height="85%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sync Arrows */}
      <path d="M25 45 A 25 25 0 0 1 75 45" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M75 55 A 25 25 0 0 1 25 55" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Arrow Heads */}
      <path d="M72 40 L 75 45 L 70 47" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M28 60 L 25 55 L 30 53" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      {/* Sink/Tap Icon */}
      <path d="M35 55 H 70" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <path d="M42 55 V 48 H 47" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <path d="M55 55 V 42 C 55 36 65 36 65 42 V 48" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

const AuthPage: React.FC = () => {
  const { login, signup, loginWithGoogle } = useApp();
  const [isLogin, setIsLogin] = useState(true); // Default to login as requested (user said opens to profile, ensuring landing page focus)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name, username);
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Password or Email Incorrect');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('User already exists. Sign in?');
      } else if (err.code === 'auth/username-already-in-use') {
        setError('Username is already taken.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Google Sign In failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 pb-12 font-sans">
      <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="mb-6">
          <Logo size={120} />
        </div>
        <h1 className="text-[48px] font-black tracking-tight leading-none mb-2 text-[#3a5866]">Sync</h1>
        <p className="text-[#1a1a1a] font-bold text-lg tracking-tight text-center opacity-80">Credit where credit is due</p>
      </div>

      <div className="w-full max-w-[400px] bg-white rounded-[40px] p-8 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-[#f1f3f5] p-1.5 rounded-[20px] flex gap-1 mb-8">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-3.5 rounded-[16px] font-bold text-sm transition-all ${isLogin ? 'bg-white shadow-sm text-[#1a4a5e]' : 'text-[#868e96]'}`}>Log In</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-3.5 rounded-[16px] font-bold text-sm transition-all ${!isLogin ? 'bg-white shadow-sm text-[#1a4a5e]' : 'text-[#868e96]'}`}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#495057] px-1">Full Name</label>
                <div className="bg-[#f8f9fa] p-4 rounded-2xl flex items-center gap-4 focus-within:ring-2 ring-[#1a4a5e]/5 transition-all">
                  <User size={18} className="text-[#adb5bd]" />
                  <input type="text" placeholder="Jane Smith" className="bg-transparent w-full text-[#1a4a5e] font-semibold focus:outline-none" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#495057] px-1">Username</label>
                <div className="bg-[#f8f9fa] p-4 rounded-2xl flex items-center gap-4 focus-within:ring-2 ring-[#1a4a5e]/5 transition-all">
                  <AtSign size={18} className="text-[#adb5bd]" />
                  <input type="text" placeholder="janesmith" className="bg-transparent w-full text-[#1a4a5e] font-semibold focus:outline-none" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#495057] px-1">Email</label>
            <div className="bg-[#f8f9fa] p-4 rounded-2xl flex items-center gap-4 focus-within:ring-2 ring-[#1a4a5e]/5 transition-all">
              <Mail size={18} className="text-[#adb5bd]" />
              <input type="email" placeholder="you@university.com" className="bg-transparent w-full text-[#1a4a5e] font-semibold focus:outline-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#495057] px-1">Password</label>
            <div className="bg-[#f8f9fa] p-4 rounded-2xl flex items-center gap-4 focus-within:ring-2 ring-[#1a4a5e]/5 transition-all">
              <Lock size={18} className="text-[#adb5bd]" />
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="bg-transparent w-full text-[#1a4a5e] font-semibold focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#adb5bd]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>

          {error && <div className="text-center text-red-500 font-bold text-xs mt-2">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#1a4a5e] to-[#e67e5f] text-white font-bold py-5 rounded-[24px] shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95">
            {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#dee2e6]"></div></div>
          <div className="relative flex justify-center"><span className="bg-white px-4 text-sm font-semibold text-[#adb5bd]">Or continue with</span></div>
        </div>

        <button onClick={handleGoogle} className="w-full bg-white border border-[#dee2e6] text-[#495057] font-bold py-4 rounded-[20px] flex items-center justify-center gap-3 transition-all active:scale-95">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          <span>Google</span>
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
