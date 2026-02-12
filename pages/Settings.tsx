
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ChevronLeft, User, Mail, Save, CheckCircle2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { user, updateSettings, logout } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(email, name);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="text-[#1a4a5e]"><ChevronLeft size={32} strokeWidth={2.5} /></button>
        <h1 className="text-3xl font-black text-[#1a4a5e]">Settings</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-4">
          <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] px-1">Profile Info</h3>
          <div className="space-y-3">
            <div className="bg-slate-50 p-5 rounded-[32px] flex items-center gap-4 border border-transparent focus-within:border-[#e67e5f]/30">
              <User size={22} className="text-slate-300" />
              <input type="text" className="w-full bg-transparent font-bold text-[#1a4a5e] focus:outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
            </div>
            <div className="bg-slate-50 p-5 rounded-[32px] flex items-center gap-4 border border-transparent focus-within:border-[#e67e5f]/30">
              <Mail size={22} className="text-slate-300" />
              <input type="email" className="flex-1 bg-transparent font-bold text-[#1a4a5e] focus:outline-none" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          {showSuccess && <div className="flex items-center justify-center gap-2 text-green-500 font-black animate-in fade-in duration-300 mb-2"><CheckCircle2 size={20} strokeWidth={3} /><span className="text-xs uppercase tracking-widest">Saved!</span></div>}
          <button type="submit" className={`w-full py-5 rounded-[24px] flex items-center justify-center gap-3 font-black shadow-xl transition-all ${showSuccess ? 'bg-green-500' : 'bg-[#1a4a5e]'} text-white`}><Save size={20} /><span className="text-sm uppercase tracking-widest">Save</span></button>
          <button type="button" onClick={logout} className="w-full bg-white text-red-500 border border-red-50 py-5 rounded-[24px] flex items-center justify-center gap-3 font-black"><LogOut size={20} /><span className="text-sm uppercase tracking-widest">Sign Out</span></button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
