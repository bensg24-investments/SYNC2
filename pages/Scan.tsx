
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ScanText, QrCode, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';

const ScanPage: React.FC = () => {
  const { user, performGroupSync } = useApp();
  const [mode, setMode] = useState<'my-id' | 'scan-id'>('my-id');
  const [syncing, setSyncing] = useState(false);

  if (!user) return null;

  const simulateScan = () => {
    setSyncing(true);
    setTimeout(() => {
      const mockFriendId = "SYNC-USER-54321";
      // Fixed: performGroupSync only takes one argument
      performGroupSync(mockFriendId);
      setSyncing(false);
      alert("Scan successful with Sync Buddy!");
    }, 2000);
  };

  return (
    <div className="p-6">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-[#1a4a5e]">
          Scan
        </h1>
        <p className="text-sm font-bold text-slate-800 mt-1 opacity-80">Study together, earn together</p>
      </div>

      {/* Tabs */}
      <div className="bg-slate-200/50 p-1.5 rounded-[20px] flex gap-1 mb-10">
        <button 
          onClick={() => setMode('my-id')}
          className={`flex-1 py-3 rounded-[16px] font-black text-sm transition-all ${
            mode === 'my-id' ? 'bg-white shadow-sm text-[#1a4a5e]' : 'text-slate-400 opacity-60'
          }`}
        >
          My ID
        </button>
        <button 
          onClick={() => setMode('scan-id')}
          className={`flex-1 py-3 rounded-[16px] font-black text-sm transition-all ${
            mode === 'scan-id' ? 'bg-white shadow-sm text-[#1a4a5e]' : 'text-slate-400 opacity-60'
          }`}
        >
          Scan ID
        </button>
      </div>

      {mode === 'my-id' ? (
        <div className="flex flex-col items-center">
          <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-slate-200/50 mb-10 border border-slate-50 flex flex-col items-center">
            <div className="bg-[#1a4a5e]/5 p-6 rounded-[32px] mb-6">
              <QRCode 
                // Fixed: Property 'uid' exists on UserState, not 'id'
                value={user.uid} 
                size={180} 
                fgColor="#1a4a5e" 
                bgColor="transparent"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
            {/* Fixed: Property 'uid' exists on UserState, not 'id' */}
            <span className="text-xl font-black text-[#1a4a5e] tracking-tight">{user.uid}</span>
          </div>

          <div className="w-full">
            <h3 className="text-lg font-black text-[#1a4a5e] mb-4">Recent Sessions</h3>
            <div className="space-y-4">
              {user.syncHistory.map(entry => (
                <div key={entry.id} className="bg-white border border-slate-50 p-5 rounded-[32px] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#e67e5f]/60 to-[#1a4a5e]/60 flex items-center justify-center text-white font-black text-sm">
                      {entry.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-black text-[#1a4a5e]">{entry.name}</div>
                      <div className="text-xs font-bold text-slate-400 mt-0.5">2 hours ago</div>
                    </div>
                  </div>
                  <div className="text-[#e67e5f] font-black text-lg">+{entry.points}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[320px] mb-10 group cursor-pointer" onClick={simulateScan}>
            <div className="absolute inset-0 bg-[#1a4a5e] rounded-[56px] overflow-hidden flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-[#e67e5f] border-dashed rounded-[40px] animate-pulse flex items-center justify-center">
                {syncing ? (
                  <RefreshCw className="text-white animate-spin" size={64} />
                ) : (
                  <ScanText className="text-white opacity-20" size={80} />
                )}
              </div>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#e67e5f] shadow-[0_0_20px_#e67e5f] animate-[scan_3s_ease-in-out_infinite]"></div>
            </div>
          </div>
          <div className="text-center px-6">
            <h2 className="text-xl font-black text-[#1a4a5e] mb-2">Ready to Scan</h2>
            <p className="text-sm font-bold text-slate-400 leading-relaxed">Place a classmate's Sync Code in the center to earn bonus points and verify your session.</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
    </div>
  );
};

export default ScanPage;
