
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserState, ClassSchedule, AppContextType, SyncHistoryEntry, StudySession, Buddy, RedemptionHistoryEntry } from './types';
import { auth, googleProvider, db } from './firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  writeBatch,
  query,
  where,
  limit
} from 'firebase/firestore';

const AppContext = createContext<any>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        const buddiesSnap = await getDocs(collection(db, 'users', uid, 'buddies'));
        const buddies = buddiesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Buddy[];

        const baseData: UserState = {
          uid: data.uid || uid,
          name: data.name || 'User',
          username: data.username || '',
          email: data.email || '',
          totalPoints: data.totalPoints || 0,
          dailyPoints: data.dailyPoints || 0,
          streak: data.streak || 0,
          dailyGoal: data.dailyGoal || 250,
          lastActiveDate: data.lastActiveDate || new Date().toISOString(),
          lastCheckInDates: data.lastCheckInDates || {},
          schedule: Array.isArray(data.schedule) ? data.schedule : [],
          totalSessions: data.totalSessions || 0,
          syncHistory: Array.isArray(data.syncHistory) ? data.syncHistory : [],
          redemptionHistory: Array.isArray(data.redemptionHistory) ? data.redemptionHistory : [],
          studyLog: Array.isArray(data.studyLog) ? data.studyLog : [],
          dailyStudyPoints: data.dailyStudyPoints || 0,
          buddies: buddies || []
        };
        
        const today = new Date();
        const lastActive = baseData.lastActiveDate ? new Date(baseData.lastActiveDate) : new Date();
        const todayStr = today.toDateString();
        const lastActiveStr = lastActive.toDateString();

        if (todayStr !== lastActiveStr) {
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();

          let updatedStreak = baseData.streak || 1;
          if (lastActiveStr === yesterdayStr) {
            updatedStreak += 1;
          } else if (lastActiveStr !== todayStr) {
            updatedStreak = 1;
          }

          const updatePayload = {
            dailyPoints: 0,
            dailyStudyPoints: 0,
            streak: updatedStreak,
            lastActiveDate: today.toISOString()
          };
          await updateDoc(doc(db, 'users', uid), updatePayload);
          return { ...baseData, ...updatePayload };
        }
        return baseData;
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userData = await fetchUserData(fbUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name: string, username: string) => {
    const usernameLower = username.toLowerCase();
    const usernameDoc = await getDoc(doc(db, 'usernames', usernameLower));
    if (usernameDoc.exists()) throw { code: 'auth/username-already-in-use' };

    const res = await createUserWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;
    try {
      const batch = writeBatch(db);
      const newUser: UserState = {
        uid, name, username: usernameLower, email,
        totalPoints: 0, dailyPoints: 0, streak: 1, dailyGoal: 250,
        lastActiveDate: new Date().toISOString(), lastCheckInDates: {},
        schedule: [], totalSessions: 0, syncHistory: [],
        redemptionHistory: [], studyLog: [], dailyStudyPoints: 0, buddies: []
      };
      batch.set(doc(db, 'users', uid), newUser);
      batch.set(doc(db, 'usernames', usernameLower), { uid });
      await batch.commit();
      await updateProfile(res.user, { displayName: name });
    } catch (err) {
      try { await deleteUser(res.user); } catch (e) {}
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    const uid = res.user.uid;
    const existing = await getDoc(doc(db, 'users', uid));
    if (!existing.exists()) {
      const baseUsername = res.user.email?.split('@')[0] || `user_${uid.substring(0, 5)}`;
      const newUser: UserState = {
        uid, name: res.user.displayName || 'User', username: baseUsername.toLowerCase(),
        email: res.user.email || '', totalPoints: 0, dailyPoints: 0, streak: 1, dailyGoal: 250,
        lastActiveDate: new Date().toISOString(), lastCheckInDates: {},
        schedule: [], totalSessions: 0, syncHistory: [],
        redemptionHistory: [], studyLog: [], dailyStudyPoints: 0, buddies: []
      };
      await setDoc(doc(db, 'users', uid), newUser);
      await setDoc(doc(db, 'usernames', baseUsername.toLowerCase()), { uid });
      setUser(newUser);
    }
  };

  const logout = () => signOut(auth);

  const checkIn = async (className: string, buddyCount: number = 0) => {
    if (!user) return;
    const today = new Date().toDateString();
    if (user.lastCheckInDates[className] === today) return;
    const pointsEarned = 50 + (buddyCount * 10);
    const updated = {
      dailyPoints: user.dailyPoints + pointsEarned,
      totalPoints: user.totalPoints + pointsEarned,
      lastCheckInDates: { ...user.lastCheckInDates, [className]: today }
    };
    await updateDoc(doc(db, 'users', user.uid), updated);
    setUser(prev => prev ? ({ ...prev, ...updated }) : null);
  };

  const logStudySession = async (minutes: number, selectedBuddyIds: string[]) => {
    if (!user || minutes <= 0) return;
    const basePoints = Math.floor(minutes / 30) * 10;
    const buddyBonus = selectedBuddyIds.length * 10; 
    const totalEarned = basePoints + buddyBonus;
    const newSession: StudySession = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      duration: minutes,
      pointsEarned: totalEarned,
      buddiesInvolved: selectedBuddyIds
    };
    const updated = {
      dailyPoints: user.dailyPoints + totalEarned,
      totalPoints: user.totalPoints + totalEarned,
      dailyStudyPoints: user.dailyStudyPoints + totalEarned,
      totalSessions: user.totalSessions + 1,
      studyLog: [newSession, ...user.studyLog]
    };
    await updateDoc(doc(db, 'users', user.uid), updated);
    setUser(prev => prev ? ({ ...prev, ...updated }) : null);
  };

  const performGroupSync = async (targetUid: string, sharedClasses: string[]) => {
    if (!user || targetUid === user.uid) throw new Error("Cannot sync with yourself");
    if (user.buddies.some(b => b.id === targetUid)) throw new Error("Buddy already added");
    
    const buddyDoc = await getDoc(doc(db, 'users', targetUid));
    if (!buddyDoc.exists()) throw new Error("Buddy not found");
    const buddyData = buddyDoc.data();

    const buddyEntry: Buddy = {
      id: targetUid,
      name: buddyData.name || 'User',
      username: buddyData.username || '',
      sharedClasses: sharedClasses
    };

    await setDoc(doc(db, 'users', user.uid, 'buddies', targetUid), buddyEntry);
    
    const newHistory: SyncHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: buddyEntry.name,
      points: 50,
      timestamp: new Date().toISOString()
    };

    const updated = {
      totalPoints: user.totalPoints + 50,
      dailyPoints: user.dailyPoints + 50,
      syncHistory: [newHistory, ...user.syncHistory].slice(0, 5),
      buddies: [buddyEntry, ...user.buddies]
    };
    await updateDoc(doc(db, 'users', user.uid), updated);
    setUser(prev => prev ? ({ ...prev, ...updated }) : null);
  };

  const findBuddy = async (identifier: string) => {
    // Try UID first
    let userDoc = await getDoc(doc(db, 'users', identifier));
    if (!userDoc.exists()) {
      // Try Username
      const usernameDoc = await getDoc(doc(db, 'usernames', identifier.toLowerCase()));
      if (usernameDoc.exists()) {
        const uid = usernameDoc.data().uid;
        userDoc = await getDoc(doc(db, 'users', uid));
      }
    }
    return userDoc.exists() ? { uid: userDoc.id, ...userDoc.data() } : null;
  };

  const updateDailyGoal = async (goal: number) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { dailyGoal: goal });
    setUser(prev => prev ? ({ ...prev, dailyGoal: goal }) : null);
  };

  const addClass = async (newClass: ClassSchedule) => {
    if (!user) return;
    const updatedSchedule = [...user.schedule, newClass];
    await updateDoc(doc(db, 'users', user.uid), { schedule: updatedSchedule });
    setUser(prev => prev ? ({ ...prev, schedule: updatedSchedule }) : null);
  };

  const removeClass = async (className: string) => {
    if (!user) return;
    const updatedSchedule = user.schedule.filter(c => c.className !== className);
    await updateDoc(doc(db, 'users', user.uid), { schedule: updatedSchedule });
    setUser(prev => prev ? ({ ...prev, schedule: updatedSchedule }) : null);
  };

  const editClass = async (oldClassName: string, updatedClass: ClassSchedule) => {
    if (!user) return;
    const updatedSchedule = user.schedule.map(c => c.className === oldClassName ? updatedClass : c);
    await updateDoc(doc(db, 'users', user.uid), { schedule: updatedSchedule });
    setUser(prev => prev ? ({ ...prev, schedule: updatedSchedule }) : null);
  };

  const updateSettings = async (email: string, name: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { email, name });
    setUser(prev => prev ? ({ ...prev, email, name }) : null);
  };

  const deleteAccount = async () => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid));
    if (user.username) await deleteDoc(doc(db, 'usernames', user.username.toLowerCase()));
    await auth.currentUser?.delete();
    setUser(null);
  };

  const redeemReward = async (rewardName: string, cost: number): Promise<boolean> => {
    if (!user || user.totalPoints < cost) return false;
    const newRedemption: RedemptionHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      rewardName, cost, timestamp: new Date().toISOString()
    };
    const updated = {
      totalPoints: user.totalPoints - cost,
      redemptionHistory: [newRedemption, ...user.redemptionHistory]
    };
    await updateDoc(doc(db, 'users', user.uid), updated);
    setUser(prev => prev ? ({ ...prev, ...updated }) : null);
    return true;
  };

  const getInitials = (name?: string) => {
    const n = name || user?.name || "??";
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return n.trim().substring(0, 2).toUpperCase();
  };

  return (
    <AppContext.Provider value={{ 
      user, loading, checkIn, updateDailyGoal, addClass, removeClass, editClass, 
      getInitials, updateSettings, deleteAccount, performGroupSync, logStudySession,
      redeemReward, signup, login, loginWithGoogle, logout, findBuddy
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
