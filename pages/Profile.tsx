
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Settings, ChevronLeft, Calendar, BookOpen, Users, TrendingUp, AtSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, getInitials, updateDailyGoal } = useApp();
  const navigate = useNavigate();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalValue, setGoalValue] = useState(user?.dailyGoal?.toString() || '250');

  if (!user) return null;

  const stats = [
    { label: 'CLASSES', value: user.schedule.length, sublabel: 'SCHEDULED', icon: <Calendar size={24} />, iconColor: 'bg-[#3b82f6]', onClick: () => navigate('/classes') },
    { label: 'STUDY', value: user.totalSessions, sublabel: 'SESSIONS', icon: <BookOpen size={24} />, iconColor: 'bg-[#ff6b6b]', onClick: () => navigate('/study') },
    { label: 'BUDDIES', value: user.buddies?.length || 0, sublabel: 'CONNECTED', icon: <Users size={24} />, iconColor: 'bg-[#f59e0b]', onClick: () => navigate('/scan') },
    { label: 'TODAY', value: user.dailyPoints, sublabel: 'POINTS', icon: <TrendingUp size={24} />, iconColor: 'bg-[#4ea398]', onClick: () => setShowGoalModal(true) },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/')} className="text-[#1a4a5e]"><ChevronLeft size={32} strokeWidth={2.5} /></button>
        <h1 className="text-3xl font-black text-[#1a4a5e]">Profile</h1>
        <Link to="/settings" className="text-slate-400"><Settings size={28} /></Link>
      </div>

      <div className="bg-gradient-to-br from-[#4ea398] via-[#85b1a3] to-[#e67e5f] rounded-[48px] p-8 text-white mb-8 shadow-xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full border-2 border-white/50 flex items-center justify-center text-3xl font-black bg-white/10 backdrop-blur-sm">{getInitials()}</div>
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black leading-none">{user.name}</h2>
            <p className="text-xs font-black uppercase tracking-widest opacity-80 flex items-center gap-1"><AtSign size={10} />{user.username}</p>
            <div className="mt-2 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full inline-flex items-center"><span className="text-[10px] font-black uppercase tracking-widest">{user.streak} DAY STREAK</span></div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-6 border border-white/20">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total Balance</div>
          <div className="flex items-baseline gap-2"><span className="text-5xl font-black">{user.totalPoints}</span><span className="text-xs font-black uppercase tracking-widest opacity-80">Sync Points</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-12">
        {stats.map((stat, index) => (
          <button key={index} onClick={stat.onClick} className="bg-white border border-slate-100 p-6 rounded-[40px] shadow-sm flex flex-col items-start gap-4 transition-transform active:scale-95 text-left w-full">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${stat.iconColor} shadow-lg shadow-black/5`}>{stat.icon}</div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
              <span className="text-3xl font-black text-[#1a4a5e] leading-none mb-1">{stat.value}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
