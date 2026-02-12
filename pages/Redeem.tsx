
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Check, CheckCircle2, Ticket, Coffee, IceCream, Utensils, X, Zap, Loader2 } from 'lucide-react';

const REWARDS_DATA = [
  { id: 'r1', name: 'Sync Sticker', cost: 100, category: 'ESSENTIALS (100 - 300 PTS)', icon: <Ticket className="text-slate-200" size={40} /> },
  { id: 'r2', name: 'Large Soda', cost: 200, category: 'ESSENTIALS (100 - 300 PTS)', icon: <Coffee className="text-slate-200" size={40} /> },
  { id: 'r3', name: 'Soft Serve', cost: 250, category: 'ESSENTIALS (100 - 300 PTS)', icon: <IceCream className="text-slate-200" size={40} /> },
  { id: 'r4', name: 'Small Fries', cost: 300, category: 'ESSENTIALS (100 - 300 PTS)', icon: <Utensils className="text-slate-200" size={40} /> },
];

const RewardCard: React.FC<{ 
  reward: typeof REWARDS_DATA[0], 
  canAfford: boolean, 
  onRedeem: (r: typeof REWARDS_DATA[0]) => void,
  isRecentRedeemed: boolean
}> = ({ reward, canAfford, onRedeem, isRecentRedeemed }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleClick = () => {
    if (!canAfford || status !== 'idle') return;
    setStatus('loading');
    
    // Simulate slight delay for "work" feeling
    setTimeout(() => {
      onRedeem(reward);
      setStatus('success');
    }, 400);
  };

  return (
    <div className="bg-white border border-slate-50 p-5 rounded-[48px] shadow-sm flex flex-col items-center transition-all hover:shadow-md active:scale-[0.98]">
      <div className={`w-full aspect-square rounded-[40px] flex items-center justify-center mb-5 transition-colors ${status === 'success' ? 'bg-[#ecfdf5]' : 'bg-[#f8f9fa]'}`}>
        {status === 'success' ? (
          <CheckCircle2 size={48} className="text-[#22c55e] animate-bounce" strokeWidth={2.5} />
        ) : status === 'loading' ? (
          <Loader2 size={40} className="text-slate-300 animate-spin" />
        ) : (
          <div className="opacity-40 grayscale contrast-125">
            {reward.icon}
          </div>
        )}
      </div>

      <div className="text-center mb-5 h-12 flex flex-col justify-center">
        <h4 className="font-black text-[#1a4a5e] text-[15px] leading-tight mb-1">{reward.name}</h4>
        <div className="text-[11px] font-black text-[#ff6b6b] uppercase tracking-widest">{reward.cost} PTS</div>
      </div>

      <button 
        onClick={handleClick}
        disabled={!canAfford || status !== 'idle'}
        className={`w-full py-4 rounded-[20px] font-black text-[11px] uppercase tracking-widest transition-all ${
          status === 'success' 
            ? 'bg-[#22c55e] text-white'
            : canAfford 
              ? 'bg-[#1e293b] text-white active:scale-95 shadow-lg shadow-slate-200' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-60'
        }`}
      >
        {status === 'success' ? 'SUCCESS!' : status === 'loading' ? 'PROCESSING...' : `REDEEM FOR ${reward.cost}`}
      </button>
    </div>
  );
};

const RedeemPage: React.FC = () => {
  const { user, redeemReward } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [animatingPoints, setAnimatingPoints] = useState(false);

  if (!user) return null;

  const handleRedeem = (reward: typeof REWARDS_DATA[0]) => {
    const success = redeemReward(reward.name, reward.cost);
    if (success) {
      setAnimatingPoints(true);
      setShowToast(true);
      setTimeout(() => setAnimatingPoints(false), 500);
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="p-6 pb-32 bg-[#f8f9fa] min-h-screen relative overflow-x-hidden">
      {/* Feedback Toast */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-sm">
          <div className="bg-[#1a4a5e] text-white rounded-[24px] p-5 flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <div className="font-black text-xs uppercase tracking-widest">Points Redeemed!</div>
                <div className="text-[9px] font-bold text-white/50">YOUR BALANCE HAS BEEN UPDATED</div>
              </div>
            </div>
            <button onClick={() => setShowToast(false)} className="text-white/40 p-1">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-black text-[#1a4a5e]">Redeem</h1>
        <p className="text-sm font-bold text-slate-400 mt-1">Trade points for real rewards</p>
      </div>

      {/* Available Points Card */}
      <div className={`bg-white rounded-[48px] p-12 mb-10 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center transition-all duration-300 ${animatingPoints ? 'scale-105 border-green-100' : ''}`}>
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Available Points</div>
        <div className="flex items-center gap-3">
           <Zap className={`text-[#e67e5f] fill-[#e67e5f] transition-transform ${animatingPoints ? 'scale-125' : ''}`} size={32} />
           <div className={`text-[96px] font-black text-[#1a4a5e] leading-none tracking-tighter transition-all ${animatingPoints ? 'text-green-600' : ''}`}>
            {user.totalPoints}
           </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2.5">
            <Check size={16} className="text-[#ff6b6b]" strokeWidth={3} />
            <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.15em]">ESSENTIALS (100 - 300 PTS)</h3>
          </div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">REAL-TIME SYNC</span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {REWARDS_DATA.map(reward => (
            <RewardCard 
              key={reward.id} 
              reward={reward} 
              canAfford={user.totalPoints >= reward.cost} 
              onRedeem={handleRedeem}
              isRecentRedeemed={user.redemptionHistory[0]?.rewardName === reward.name}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-12 p-8 bg-blue-50/30 rounded-[32px] border border-blue-100/50 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] leading-relaxed">
          Coupon codes are valid for 24 hours. Points are non-refundable once redeemed.
        </p>
      </div>
    </div>
  );
};

export default RedeemPage;
