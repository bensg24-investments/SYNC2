
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { UserCircle, Zap, MapPin, Clock, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DayOfWeek } from '../types';

const HomePage: React.FC = () => {
  const { user, checkIn } = useApp();
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>([]);

  if (!user) return null;

  const todayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()] as DayOfWeek;
  const classesToday = user.schedule.filter(c => c.days.includes(todayName));
  const nextClass = classesToday[0];

  const progress = (user.dailyPoints / user.dailyGoal) * 100;
  const radius = 100;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  const handleCheckIn = async () => {
    if (nextClass) {
      await checkIn(nextClass.className, selectedBuddies.length);
      setShowCheckInModal(false);
      setSelectedBuddies([]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-4xl font-black text-[#1a4a5e]">Home</h1>
          <p className="text-[13px] font-bold text-slate-800 mt-0.5 opacity-60">Credit where credit is due</p>
        </div>
        <Link to="/profile" className="text-[#1a4a5e] mt-2">
          <UserCircle size={32} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="w-full flex flex-col items-center justify-center mb-8 pt-4">
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 288 288">
            <circle cx="144" cy="144" r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="transparent" />
            <circle cx="144" cy="144" r={radius} stroke="#e67e5f" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="text-center z-10 flex flex-col items-center justify-center select-none">
            <div className="text-[84px] font-black text-[#1a4a5e] leading-none tracking-tighter">{user.dailyPoints}</div>
            <div className="text-xl font-bold text-[#1a4a5e] opacity-40 leading-none -mt-1">/{user.dailyGoal}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-5">Today's Points</div>
          </div>
        </div>
        <div className="mt-4 bg-white/70 backdrop-blur-sm px-6 py-3.5 rounded-full shadow-sm flex items-center gap-2.5 border border-white/80">
          <Zap size={18} className="text-[#e67e5f] fill-[#e67e5f]" />
          <span className="font-black text-[#1a4a5e] text-lg leading-none">{user.totalPoints}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Sync Points</span>
        </div>
      </div>

      {nextClass ? (
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[#e67e5f] text-[10px] font-black uppercase tracking-[0.2em]">Next Class Today</span>
              <h2 className="text-2xl font-black text-[#1a4a5e] mt-1">{nextClass.className}</h2>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-full text-[10px] font-black text-[#e67e5f]">+50 pts</div>
          </div>
          <div className="flex gap-4 text-slate-400 font-bold text-sm mb-8">
            <div className="flex items-center gap-1.5"><Clock size={16} /><span>{nextClass.startTime}</span></div>
            <div className="flex items-center gap-1.5"><MapPin size={16} /><span>{nextClass.location || 'University Campus'}</span></div>
          </div>
          <button onClick={() => setShowCheckInModal(true)} className="w-full bg-[#1a4a5e] text-white font-black py-5 rounded-[24px] shadow-xl shadow-[#1a4a5e]/20 active:scale-95 transition-transform">Check In Now</button>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-50 text-center">
          <p className="text-slate-400 font-bold">No classes scheduled for today.</p>
          <Link to="/classes" className="text-[#e67e5f] font-black uppercase text-xs tracking-widest mt-4 inline-block">Edit Schedule</Link>
        </div>
      )}

      {showCheckInModal && (
        <div className="fixed inset-0 bg-[#1a4a5e]/20 backdrop-blur-md z-[100] flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[48px] overflow-hidden shadow-2xl p-10 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-[#1a4a5e]">{nextClass.className}</h2>
                <p className="text-slate-400 font-bold text-base mt-1">{nextClass.location || 'Main Campus'}</p>
              </div>
              <button onClick={() => setShowCheckInModal(false)} className="bg-slate-50 p-2 rounded-2xl text-slate-400"><X size={24} /></button>
            </div>
            <div className="bg-[#fdf9f8] p-8 rounded-[36px] mb-10 border border-[#e67e5f]/5">
              <div className="flex justify-between items-center"><span className="text-sm font-bold text-[#1a4a5e]/60">Base Points</span><span className="text-base font-black text-[#1a4a5e] tracking-tight">+50</span></div>
              <div className="pt-5 mt-5 border-t border-slate-200/60 flex justify-between items-center"><span className="text-xl font-black text-[#1a4a5e]">Total</span><span className="text-2xl font-black text-[#e67e5f] tracking-tighter">+50</span></div>
            </div>
            <button onClick={handleCheckIn} className="w-full bg-gradient-to-r from-[#1a4a5e] to-[#e67e5f]/90 text-white font-black py-6 rounded-[28px] flex items-center justify-center gap-3 shadow-xl shadow-[#1a4a5e]/20 transition-all">
              <Zap size={22} fill="white" /><span className="text-lg">Check In</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
