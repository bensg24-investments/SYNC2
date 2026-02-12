
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { UserCircle, Zap, MapPin, Clock, X, CheckCircle2, Users, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DayOfWeek } from '../types';

const HomePage: React.FC = () => {
  const { user, checkIn, getInitials } = useApp();
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>([]);

  if (!user) return null;

  const todayStr = new Date().toDateString();
  const todayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()] as DayOfWeek;
  
  const schedule = Array.isArray(user.schedule) ? user.schedule : [];
  const classesToday = schedule.filter(c => c.days.includes(todayName));
  const nextClass = classesToday[0];

  const progress = (user.dailyPoints / user.dailyGoal) * 100;
  const radius = 100;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  // Filter buddies who share this specific class
  const eligibleBuddies = user.buddies.filter(buddy => 
    nextClass && buddy.sharedClasses.includes(nextClass.className)
  );

  const toggleBuddy = (id: string) => {
    setSelectedBuddies(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleCheckIn = async () => {
    if (nextClass) {
      await checkIn(nextClass.className, selectedBuddies.length);
      setShowCheckInModal(false);
      setSelectedBuddies([]);
    }
  };

  // Check if already checked in for the specific class today
  const isAlreadyCheckedIn = nextClass && user.lastCheckInDates[nextClass.className] === todayStr;

  const buddyBonus = selectedBuddies.length * 10;
  const totalCheckInPoints = 50 + buddyBonus;

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
        <div className={`bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 relative overflow-hidden transition-all ${isAlreadyCheckedIn ? 'opacity-80 scale-[0.98]' : ''}`}>
          {isAlreadyCheckedIn && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 bg-white/80 px-6 py-4 rounded-3xl shadow-sm">
                <CheckCircle2 size={40} className="text-[#e67e5f]" />
                <span className="font-black text-[#1a4a5e] uppercase tracking-widest text-[10px]">Sync Complete</span>
              </div>
            </div>
          )}
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
          <button 
            onClick={() => !isAlreadyCheckedIn && setShowCheckInModal(true)} 
            disabled={isAlreadyCheckedIn}
            className={`w-full font-black py-5 rounded-[24px] shadow-xl transition-all active:scale-95 ${isAlreadyCheckedIn ? 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed' : 'bg-[#1a4a5e] text-white shadow-[#1a4a5e]/20 hover:bg-[#255b70]'}`}
          >
            {isAlreadyCheckedIn ? 'Attendance Logged' : 'Check In Now'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-50 text-center">
          <p className="text-slate-400 font-bold">No classes scheduled for today.</p>
          <Link to="/classes" className="text-[#e67e5f] font-black uppercase text-xs tracking-widest mt-4 inline-block">Edit Schedule</Link>
        </div>
      )}

      {showCheckInModal && (
        <div className="fixed inset-0 bg-[#1a4a5e]/40 backdrop-blur-md z-[100] flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[48px] overflow-hidden shadow-2xl p-10 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black text-[#1a4a5e]">{nextClass?.className}</h2>
                <p className="text-slate-400 font-bold text-sm mt-1">{nextClass?.location || 'Main Campus'}</p>
              </div>
              <button onClick={() => { setShowCheckInModal(false); setSelectedBuddies([]); }} className="bg-slate-50 p-2 rounded-2xl text-slate-400"><X size={24} /></button>
            </div>

            {eligibleBuddies.length > 0 && (
              <div className="mb-8 bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} className="text-[#1a4a5e]" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Check in with Buddies (+10 pts each)</h4>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
                  {eligibleBuddies.map(buddy => {
                    const isSelected = selectedBuddies.includes(buddy.id);
                    return (
                      <button 
                        key={buddy.id}
                        onClick={() => toggleBuddy(buddy.id)}
                        className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${isSelected ? 'scale-105' : 'opacity-50'}`}
                      >
                        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${isSelected ? 'border-[#e67e5f] bg-[#e67e5f]/10 text-[#e67e5f]' : 'border-slate-200 bg-white text-slate-300'}`}>
                          {getInitials(buddy.name)}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-[#e67e5f] text-white rounded-full p-1 shadow-md border-2 border-white">
                              <Check size={10} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-tight max-w-[64px] truncate ${isSelected ? 'text-[#1a4a5e]' : 'text-slate-400'}`}>
                          {buddy.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-[#fdf9f8] p-8 rounded-[36px] mb-8 border border-[#e67e5f]/10 shadow-sm shadow-[#e67e5f]/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-bold text-[#1a4a5e]/60 uppercase tracking-widest">Base Attendance</span>
                <span className="text-lg font-black text-[#1a4a5e]">+50</span>
              </div>
              {selectedBuddies.length > 0 && (
                <div className="flex justify-between items-center mb-4 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-[11px] font-bold text-[#e67e5f] uppercase tracking-widest">Buddy Bonus ({selectedBuddies.length})</span>
                  <span className="text-lg font-black text-[#e67e5f]">+{buddyBonus}</span>
                </div>
              )}
              <div className="pt-5 mt-5 border-t border-slate-200/60 flex justify-between items-center">
                <span className="text-xl font-black text-[#1a4a5e]">Total Reward</span>
                <span className="text-3xl font-black text-[#e67e5f] tracking-tighter">+{totalCheckInPoints}</span>
              </div>
            </div>

            <button onClick={handleCheckIn} className="w-full bg-gradient-to-br from-[#3b5866] to-[#e67e5f] text-white font-black py-6 rounded-[28px] flex items-center justify-center gap-3 shadow-xl shadow-slate-200/50 active:scale-95 transition-all">
              <Zap size={22} fill="white" /><span className="text-lg">Commit Points</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
