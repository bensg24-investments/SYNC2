
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { ScanText, RefreshCw, UserPlus, CheckCircle2, AlertCircle, X, AtSign, Users, CheckSquare, Square, Edit2, Trash2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Html5Qrcode } from 'html5-qrcode';

const ScanPage: React.FC = () => {
  const { user, performGroupSync, findBuddy, getInitials, updateBuddySharedClasses, removeBuddy } = useApp();
  const [mode, setMode] = useState<'my-id' | 'scan-id'>('my-id');
  const [syncing, setSyncing] = useState(false);
  const [manualId, setManualId] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Potential buddy review state
  const [potentialBuddy, setPotentialBuddy] = useState<any>(null);
  const [selectedSharedClasses, setSelectedSharedClasses] = useState<string[]>([]);

  // Edit buddy state
  const [editingBuddy, setEditingBuddy] = useState<any>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerBusy = useRef(false);

  useEffect(() => {
    if (mode === 'scan-id' && !showManual && !potentialBuddy && !editingBuddy) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => { if (scannerRef.current?.isScanning) stopScanner(); };
  }, [mode, showManual, potentialBuddy, editingBuddy]);

  const startScanner = async () => {
    if (scannerBusy.current || scannerRef.current?.isScanning) return;
    scannerBusy.current = true;
    try {
      const reader = document.getElementById("reader");
      if (!reader) { scannerBusy.current = false; return; }
      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => handleDiscovery(decodedText),
        () => {}
      );
    } catch (err) { setShowManual(true); } finally { scannerBusy.current = false; }
  };

  const stopScanner = async () => {
    if (scannerBusy.current) return;
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerBusy.current = true;
      try { await scannerRef.current.stop(); scannerRef.current = null; } catch (err) {} finally { scannerBusy.current = false; }
    }
  };

  const handleDiscovery = async (identifier: string) => {
    if (!identifier || identifier === user?.uid || identifier.toLowerCase() === user?.username) {
       setErrorMessage("You cannot sync with yourself.");
       return;
    }
    
    // Check duplicates
    if (user?.buddies.some(b => b.id === identifier || b.username === identifier.toLowerCase())) {
      setErrorMessage("This buddy is already in your list.");
      return;
    }

    setSyncing(true);
    setErrorMessage('');
    try {
      const buddyData = await findBuddy(identifier);
      if (buddyData) {
        setPotentialBuddy(buddyData);
        // Pre-select classes with same name (auto-match)
        const myClassNames = user?.schedule.map(c => c.className) || [];
        const matches = (buddyData.schedule || [])
          .filter((c: any) => myClassNames.includes(c.className))
          .map((c: any) => c.className);
        setSelectedSharedClasses(matches);
        await stopScanner();
      } else {
        setErrorMessage("Could not find buddy with that ID or Username.");
      }
    } catch (err) {
      setErrorMessage("Error searching for buddy.");
    } finally {
      setSyncing(false);
    }
  };

  const finalizeSync = async () => {
    if (!potentialBuddy) return;
    setSyncing(true);
    try {
      await performGroupSync(potentialBuddy.uid, selectedSharedClasses);
      setSuccessMessage(`${potentialBuddy.name} added!`);
      setPotentialBuddy(null);
      setManualId('');
      setShowManual(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const handleEditBuddy = async (buddy: any) => {
    setSyncing(true);
    try {
      const fullProfile = await findBuddy(buddy.id);
      if (fullProfile) {
        setEditingBuddy({ ...fullProfile, sharedClasses: buddy.sharedClasses });
        setSelectedSharedClasses(buddy.sharedClasses);
      }
    } catch (err) {
      setErrorMessage("Failed to load buddy profile.");
    } finally {
      setSyncing(false);
    }
  };

  const saveEdit = async () => {
    if (!editingBuddy) return;
    setSyncing(true);
    try {
      await updateBuddySharedClasses(editingBuddy.uid, selectedSharedClasses);
      setSuccessMessage("Buddy updated!");
      setEditingBuddy(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage("Failed to update buddy.");
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteBuddy = async () => {
    if (!editingBuddy) return;
    if (!confirm(`Are you sure you want to remove ${editingBuddy.name}?`)) return;
    setSyncing(true);
    try {
      await removeBuddy(editingBuddy.uid);
      setSuccessMessage("Buddy removed.");
      setEditingBuddy(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage("Failed to remove buddy.");
    } finally {
      setSyncing(false);
    }
  };

  const toggleClass = (className: string) => {
    setSelectedSharedClasses(prev => prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]);
  };

  if (!user) return null;

  return (
    <div className="p-6 pb-32">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#1a4a5e]">Scan</h1>
          <p className="text-sm font-bold text-slate-800 mt-1 opacity-80">Study together, earn together</p>
        </div>
        <div className="bg-[#1a4a5e]/5 px-4 py-2 rounded-2xl flex items-center gap-2 border border-[#1a4a5e]/10">
          <AtSign size={14} className="text-[#1a4a5e] opacity-40" />
          <span className="text-sm font-black text-[#1a4a5e]">{user.username}</span>
        </div>
      </div>

      <div className="bg-slate-200/50 p-1.5 rounded-[20px] flex gap-1 mb-10">
        <button onClick={() => { setMode('my-id'); setShowManual(false); }} className={`flex-1 py-3 rounded-[16px] font-black text-sm transition-all ${mode === 'my-id' ? 'bg-white shadow-sm text-[#1a4a5e]' : 'text-slate-400 opacity-60'}`}>My ID</button>
        <button onClick={() => setMode('scan-id')} className={`flex-1 py-3 rounded-[16px] font-black text-sm transition-all ${mode === 'scan-id' ? 'bg-white shadow-sm text-[#1a4a5e]' : 'text-slate-400 opacity-60'}`}>Scan ID</button>
      </div>

      {mode === 'my-id' ? (
        <div className="flex flex-col items-center">
          <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-slate-200/50 mb-10 border border-slate-50 flex flex-col items-center w-full max-w-[340px]">
            <div className="bg-[#1a4a5e]/5 p-6 rounded-[32px] mb-6">
              <QRCode value={user.uid} size={180} fgColor="#1a4a5e" bgColor="transparent" style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-[#1a4a5e] mb-1"><AtSign size={14} className="opacity-40" /><span className="text-lg font-black">{user.username}</span></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block opacity-50">{user.uid}</span>
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-[#1a4a5e]" />
              <h3 className="text-lg font-black text-[#1a4a5e]">My Buddies</h3>
            </div>
            <div className="space-y-4">
              {user.buddies.length > 0 ? user.buddies.map(buddy => (
                <div key={buddy.id} className="bg-white border border-slate-50 p-5 rounded-[32px] shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-[#1a4a5e] font-black text-sm">{getInitials(buddy.name)}</div>
                    <div>
                      <div className="font-black text-[#1a4a5e]">{buddy.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">@{buddy.username} • {buddy.sharedClasses.length} SHARED</div>
                    </div>
                  </div>
                  <button onClick={() => handleEditBuddy(buddy)} className="p-3 text-slate-300 hover:text-[#e67e5f] transition-colors"><Edit2 size={20} /></button>
                </div>
              )) : (
                <div className="bg-slate-100/50 border border-dashed border-slate-200 p-8 rounded-[32px] text-center">
                  <p className="text-sm font-bold text-slate-400">You haven't added any buddies yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {!showManual ? (
            <>
              <div className="relative w-full aspect-square max-w-[320px] mb-10 overflow-hidden bg-[#1a4a5e] rounded-[56px] shadow-2xl">
                <div id="reader" className="w-full h-full"></div>
                {!scannerRef.current && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-4">
                    <ScanText size={80} strokeWidth={1} />
                    <span className="text-xs font-black uppercase tracking-widest">Initialising Camera...</span>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   <div className="w-56 h-56 border-2 border-[#e67e5f] border-dashed rounded-[40px] opacity-40"></div>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-[#e67e5f] shadow-[0_0_20px_#e67e5f] animate-[scan_3s_ease-in-out_infinite] opacity-80 pointer-events-none"></div>
              </div>
              <div className="text-center px-6 mb-8">
                <h2 className="text-xl font-black text-[#1a4a5e] mb-2">Ready to Scan</h2>
                <p className="text-sm font-bold text-slate-400 leading-relaxed">Scan a friend's QR code to link your schedules.</p>
              </div>
              <button onClick={() => setShowManual(true)} className="flex items-center gap-2 text-[#e67e5f] font-black uppercase text-[11px] tracking-widest hover:opacity-80 transition-all"><UserPlus size={16} /><span>Or enter ID manually</span></button>
            </>
          ) : (
            <div className="w-full max-w-[340px] bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 animate-in fade-in zoom-in duration-300">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-black text-[#1a4a5e]">Manual Connect</h3>
                 <button onClick={() => setShowManual(false)} className="text-slate-300"><X size={20} /></button>
               </div>
               <p className="text-xs font-bold text-slate-400 mb-6 leading-relaxed">Enter your friend's Username or unique Sync Code.</p>
               <div className="space-y-6">
                 <input type="text" value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="Username or UID..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 font-black text-[#1a4a5e] focus:outline-none focus:ring-2 ring-[#e67e5f]/20 transition-all" />
                 <button onClick={() => handleDiscovery(manualId)} disabled={syncing || !manualId} className="w-full bg-[#1a4a5e] text-white py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#1a4a5e]/20 disabled:opacity-50">
                   {syncing ? <RefreshCw className="animate-spin" size={18} /> : <UserPlus size={18} />}<span>Find Buddy</span>
                 </button>
               </div>
            </div>
          )}

          {errorMessage && <div className="mt-8 flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-tight bg-red-50 px-6 py-3 rounded-full animate-in slide-in-from-top-2"><AlertCircle size={16} /><span>{errorMessage}</span></div>}
          {successMessage && <div className="mt-8 flex items-center gap-2 text-green-500 font-black text-xs uppercase tracking-tight bg-green-50 px-6 py-3 rounded-full animate-in slide-in-from-top-2"><CheckCircle2 size={16} /><span>{successMessage}</span></div>}
        </div>
      )}

      {/* Buddy Review/Edit Modal */}
      {(potentialBuddy || editingBuddy) && (
        <div className="fixed inset-0 bg-[#1a4a5e]/40 backdrop-blur-md z-[300] flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-[#1a4a5e] font-black text-xl">{getInitials(potentialBuddy?.name || editingBuddy?.name)}</div>
                 <div>
                   <h2 className="text-2xl font-black text-[#1a4a5e]">{potentialBuddy?.name || editingBuddy?.name}</h2>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">@{potentialBuddy?.username || editingBuddy?.username}</p>
                 </div>
               </div>
               <button onClick={() => { setPotentialBuddy(null); setEditingBuddy(null); }} className="text-slate-300 p-2"><X size={28} /></button>
             </div>

             <div className="mb-8">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Overlap Check</h4>
               <p className="text-xs font-bold text-slate-400 leading-relaxed mb-6">Select which classes you have together to earn collaboration bonuses.</p>
               
               <div className="space-y-3">
                 {(potentialBuddy?.schedule || editingBuddy?.schedule || []).map((cls: any) => {
                   const isSelected = selectedSharedClasses.includes(cls.className);
                   return (
                     <button key={cls.className} onClick={() => toggleClass(cls.className)} className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${isSelected ? 'bg-[#1a4a5e] border-[#1a4a5e] text-white shadow-lg' : 'bg-slate-50 border-transparent text-[#1a4a5e]'}`}>
                       <div className="text-left">
                         <div className="font-black text-sm">{cls.className}</div>
                         <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isSelected ? 'opacity-60' : 'text-slate-400'}`}>{cls.startTime} - {cls.endTime}</div>
                       </div>
                       {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="opacity-20" />}
                     </button>
                   );
                 })}
                 {!(potentialBuddy?.schedule?.length || editingBuddy?.schedule?.length) && (
                   <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                     <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Buddy has no classes listed</p>
                   </div>
                 )}
               </div>
             </div>

             <div className="space-y-4">
               <button onClick={potentialBuddy ? finalizeSync : saveEdit} disabled={syncing} className="w-full bg-gradient-to-r from-[#1a4a5e] to-[#e67e5f] text-white font-black py-6 rounded-[28px] flex items-center justify-center gap-3 shadow-xl transition-all">
                  {syncing ? <RefreshCw className="animate-spin" size={22} /> : <CheckCircle2 size={22} />}
                  <span className="text-lg">{potentialBuddy ? 'Finalize Sync' : 'Save Changes'}</span>
               </button>
               
               {editingBuddy && (
                 <button onClick={handleDeleteBuddy} disabled={syncing} className="w-full bg-red-50 text-red-500 font-black py-4 rounded-[24px] flex items-center justify-center gap-2 transition-all hover:bg-red-100">
                    <Trash2 size={18} />
                    <span className="text-xs uppercase tracking-widest">Delete Buddy</span>
                 </button>
               )}
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan { 0%, 100% { top: 10%; } 50% { top: 90%; } }
        #reader { background-color: transparent !important; border: none !important; }
        #reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; }
      `}</style>
    </div>
  );
};

export default ScanPage;
