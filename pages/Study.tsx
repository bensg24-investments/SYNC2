
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Clock, Star, X, User, Users, CheckCircle2, History, CalendarDays } from 'lucide-react';

const DURATIONS = [
  { label: '30M', value: 30 },
  { label: '1H', value: 60 },
  { label: '2H', value: 120 },
  { label: 'CUSTOM', value: 0 }
];

const StudyPage: React.FC = () => {
  const { user, logStudySession } = useApp();
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showBuddyModal, setShowBuddyModal] = useState(false);
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>([]);
  const [finalDuration, setFinalDuration] = useState(30);

  if (!user) return null;

  const handleLogClick = () => {
    let duration = selectedDuration;
    if (duration === 0) {
      const input = prompt("Enter duration in minutes:", "45");
      duration = parseInt(input || "0");
    }
    if (duration > 0) {
      setFinalDuration(duration);
      setShowCompleteModal(true);
    }
  };

  const handleStudyAlone = () => {
    logStudySession(finalDuration, []);
    setShowCompleteModal(false);
  };

  const handleStudyWithBuddies = () => setShowBuddyModal(true);

  const toggleBuddy = (id: string) => {
    setSelectedBuddies(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const confirmBuddyLog = () => {
    logStudySession(finalDuration, selectedBuddies);
    setShowBuddyModal(false);
    setShowCompleteModal(false);
    setSelectedBuddies([]);
  };

  const basePoints = Math.floor(finalDuration / 30) * 10;

  return (
    <div className="p-8 pb-32">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[#1a4a5e]">Study</h1>
        <p className="text-base font-bold text-slate-400 mt-1">Log your study time and earn</p>
      </div>

      <div className="relative bg-gradient-to-br from-[#8155ff] to-[#6d38e0] rounded-[40px] p-10 mb-10 overflow-hidden shadow-[0_20px_40px_rgba(109,56,224,0.2)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10">
          <div className="text-[11px] font-black text-white/70 uppercase tracking-[0.2em] mb-3">Today's Study Points</div>
          <div className="flex items-baseline gap-3">
            <span className="text-[72px] font-black text-white leading-none tracking-tighter">{user.dailyStudyPoints || 0}</span>
            <span className="text-xl font-bold text-white/80 leading-none">pts earned</span>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-5">Study Duration</h3>
        <div className="grid grid-cols-4 gap-3">
          {DURATIONS.map((dur) => (
            <button
              key={dur.label}
              onClick={() => setSelectedDuration(dur.value)}
              className={`py-6 rounded-[20px] font-black text-[13px] transition-all ${
                (selectedDuration === dur.value && dur.value !== 0) || (selectedDuration === 0 && dur.value === 0)
                  ? 'bg-[#ff6b6b] text-white shadow-[0_10px_20px_rgba(255,107,107,0.3)] scale-[1.05]'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {dur.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleLogClick} className="w-full bg-[#1e293b] text-white font-black py-6 rounded-[32px] flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all mb-10">
        <Clock size={22} strokeWidth={2.5} /><span className="text-sm tracking-widest uppercase">Log Session</span>
      </button>

      {/* Recent Sessions List */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <History size={18} className="text-[#1a4a5e]" />
          <h3 className="text-lg font-black text-[#1a4a5e]">Recent Sessions</h3>
        </div>
        <div className="space-y-4">
          {user.studyLog.length > 0 ? user.studyLog.map(session => (
            <div key={session.id} className="bg-white border border-slate-50 p-6 rounded-[32px] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a4a5e]">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <div className="font-black text-[#1a4a5e]">{new Date(session.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                  <div className="text-xs font-bold text-slate-400 mt-0.5">{session.duration} mins • {session.buddiesInvolved.length} buddies</div>
                </div>
              </div>
              <div className="text-[#e67e5f] font-black">+{session.pointsEarned}</div>
            </div>
          )) : (
            <div className="bg-slate-50 p-10 rounded-[32px] text-center border border-dashed border-slate-200">
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No sessions logged today</p>
            </div>
          )}
        </div>
      </div>

      {showCompleteModal && (
        <div className="fixed inset-0 bg-[#1a4a5e]/40 backdrop-blur-md z-[200] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[48px] p-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-black text-[#1a4a5e]">Session Complete?</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{finalDuration}M SESSION • {basePoints} BASE PTS</p>
              </div>
              <button onClick={() => setShowCompleteModal(false)} className="bg-slate-50 p-2 rounded-2xl text-slate-400"><X size={24} /></button>
            </div>
            <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed">Did you study with anyone today? Social studying earns you significant bonus points!</p>
            <div className="space-y-4 mb-8">
              <button onClick={handleStudyAlone} className="w-full flex items-center gap-6 p-6 rounded-[32px] border-2 border-slate-100 hover:border-[#1a4a5e] group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#1a4a5e]/10 group-hover:text-[#1a4a5e] transition-all"><User size={28} /></div>
                <div className="text-left"><div className="text-xl font-black text-[#1a4a5e]">Studied Alone</div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Commit Base Points</div></div>
              </button>
              <button onClick={handleStudyWithBuddies} className="w-full flex items-center gap-6 p-6 rounded-[32px] border-2 border-red-50 bg-red-50/20 hover:border-[#ff6b6b] group">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-[#ff6b6b] group-hover:scale-110 transition-all"><Users size={28} /></div>
                <div className="text-left"><div className="text-xl font-black text-[#1a4a5e]">With Buddies</div><div className="text-[10px] font-black text-[#ff6b6b] uppercase tracking-widest mt-1">Earn Collaboration Bonuses</div></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {showBuddyModal && (
        <div className="fixed inset-0 bg-[#f8f9fa] z-[210] overflow-y-auto no-scrollbar">
          <div className="p-8 pb-32 max-w-md mx-auto min-h-screen bg-white shadow-2xl">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-[28px] font-black text-[#1a4a5e]">Study Buddies</h2>
              <button onClick={() => setShowBuddyModal(false)} className="bg-slate-50 p-2 rounded-xl text-slate-400"><X size={20} /></button>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mb-8 leading-relaxed uppercase tracking-widest">Select who you studied with. Classmates (+20 pts) vs generic buddies (+10 pts).</p>
            <div className="space-y-4">
              {user.buddies?.map(buddy => {
                const isSelected = selectedBuddies.includes(buddy.id);
                const isClassmate = buddy.sharedClasses.length > 0;
                const buddyInitials = buddy.name ? buddy.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
                return (
                  <button key={buddy.id} onClick={() => toggleBuddy(buddy.id)} className={`w-full flex items-center justify-between p-5 rounded-[24px] border transition-all ${isSelected ? 'bg-white border-[#3b82f6] shadow-lg shadow-blue-500/10' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-slate-400 text-xs bg-slate-100">{buddyInitials}</div>
                      <div className="text-left">
                        <div className="font-black text-[#1a4a5e] text-lg leading-none mb-1">{buddy.name}</div>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${isClassmate ? 'text-blue-500' : 'text-slate-400'}`}>{isClassmate ? 'Classmate (+20)' : 'Sync Buddy (+10)'}</div>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#3b82f6] border-[#3b82f6]' : 'border-slate-100'}`}>{isSelected && <CheckCircle2 className="text-white" size={14} />}</div>
                  </button>
                );
              })}
            </div>
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[340px] z-[220]">
              <button onClick={confirmBuddyLog} className={`w-full py-5 rounded-full font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-slate-200/50 flex items-center justify-center gap-2 ${selectedBuddies.length > 0 ? 'bg-[#1a4a5e] text-white' : 'bg-[#e2e8f0] text-slate-400'}`}>Log with {selectedBuddies.length} Buddy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPage;
