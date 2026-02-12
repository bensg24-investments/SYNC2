
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
  writeBatch
} from 'firebase/firestore';

const AppContext = createContext<AppContextType | undefined>(undefined);

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

        // Defensively ensure all array properties are initialized
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
    
    // 1. Pre-check username availability (Fast fail)
    const usernameDoc = await getDoc(doc(db, 'usernames', usernameLower));
    if (usernameDoc.exists()) {
      throw { code: 'auth/username-already-in-use' };
    }

    // 2. Perform Auth (Outside transaction to avoid "Unexpected state" error)
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;

    try {
      // 3. Setup Firestore Profile
      const batch = writeBatch(db);
      
      const newUser: UserState = {
        uid,
        name,
        username: usernameLower,
        email,
        totalPoints: 0,
        dailyPoints: 0,
        streak: 1,
        dailyGoal: 250,
        lastActiveDate: new Date().toISOString(),
        lastCheckInDates: {},
        schedule: [],
        totalSessions: 0,
        syncHistory: [],
        redemptionHistory: [],
        studyLog: [],
        dailyStudyPoints: 0,
        buddies: []
      };

      batch.set(doc(db, 'users', uid), newUser);
      batch.set(doc(db, 'usernames', usernameLower), { uid });
      
      await batch.commit();
      await updateProfile(res.user, { displayName: name });
      
      // User state will be set by the onAuthStateChanged listener
    } catch (err) {
      // If profile creation fails, we attempt to clean up the Auth user to allow retry
      try {
        await deleteUser(res.user);
      } catch (cleanupErr) {
        console.error("Failed to clean up user after profile creation error", cleanupErr);
      }
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
      const name = res.user.displayName || 'Sync User';
      
      const newUser: UserState = {
        uid,
        name,
        username: baseUsername.toLowerCase(),
        email: res.user.email || '',
        totalPoints: 0,
        dailyPoints: 0,
        streak: 1,
        dailyGoal: 250,
        lastActiveDate: new Date().toISOString(),
        lastCheckInDates: {},
        schedule: [],
        totalSessions: 0,
        syncHistory: [],
        redemptionHistory: [],
        studyLog: [],
        dailyStudyPoints: 0,
        buddies: []
      };
      await setDoc(doc(db, 'users', uid), newUser);
      await setDoc(doc(db, 'usernames', baseUsername.toLowerCase()), { uid });
      setUser(newUser);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

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

  const updateDailyGoal = async (goal: number) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { dailyGoal: goal });
    setUser(prev => prev ? ({ ...prev, dailyGoal: goal }) : null);
  };

  const addClass = async (newClass: ClassSchedule) => {
    if (!user) return;
    const updatedSchedule = [...(Array.isArray(user.schedule) ? user.schedule : []), newClass];
    await updateDoc(doc(db, 'users', user.uid), { schedule: updatedSchedule });
    setUser(prev => prev ? ({ ...prev, schedule: updatedSchedule }) : null);
  };

  const removeClass = async (className: string) => {
    if (!user) return;
    const updatedSchedule = (Array.isArray(user.schedule) ? user.schedule : []).filter(c => c.className !== className);
    await updateDoc(doc(db, 'users', user.uid), { schedule: updatedSchedule });
    setUser(prev => prev ? ({ ...prev, schedule: updatedSchedule }) : null);
  };

  const editClass = async (oldClassName: string, updatedClass: ClassSchedule) => {
    if (!user) return;
    const updatedSchedule = (Array.isArray(user.schedule) ? user.schedule : []).map(c => c.className === oldClassName ? updatedClass : c);
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
    const uid = user.uid;
    const username = user.username;
    await deleteDoc(doc(db, 'users', uid));
    if (username) {
      await deleteDoc(doc(db, 'usernames', username.toLowerCase()));
    }
    await auth.currentUser?.delete();
    setUser(null);
  };

  const performGroupSync = async (targetUid: string) => {
    if (!user || targetUid === user.uid) return;
    
    const buddyDoc = await getDoc(doc(db, 'users', targetUid));
    if (!buddyDoc.exists()) return;

    const buddyData = buddyDoc.data();
    const buddySchedule = Array.isArray(buddyData.schedule) ? buddyData.schedule : [];
    const mySchedule = Array.isArray(user.schedule) ? user.schedule : [];

    const sharedClasses = mySchedule
      .filter(c => buddySchedule.some((bc: any) => bc.className === c.className))
      .map(c => c.className);

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
      syncHistory: [newHistory, ...(Array.isArray(user.syncHistory) ? user.syncHistory : [])].slice(0, 5),
      buddies: [buddyEntry, ...(Array.isArray(user.buddies) ? user.buddies : [])]
    };
    await updateDoc(doc(db, 'users', user.uid), updated);
    setUser(prev => prev ? ({ ...prev, ...updated }) : null);
  };

  const redeemReward = async (rewardName: string, cost: number): Promise<boolean> => {
    if (!user || user.totalPoints < cost) return false;
    const newRedemption: RedemptionHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      rewardName,
      cost,
      timestamp: new Date().toISOString()
    };
    const updated = {
      totalPoints: user.totalPoints - cost,
      redemptionHistory: [newRedemption, ...(Array.isArray(user.redemptionHistory) ? user.redemptionHistory : [])]
    };
    await updateDoc(doc(db, 'users', user.uid), updated);
    setUser(prev => prev ? ({ ...prev, ...updated }) : null);
    return true;
  };

  const getInitials = () => {
    if (!user || !user.name) return "??";
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return user.name.trim().substring(0, 2).toUpperCase();
  };

  return (
    <AppContext.Provider value={{ 
      user, loading, checkIn, updateDailyGoal, addClass, removeClass, editClass, 
      getInitials, updateSettings, deleteAccount, performGroupSync, logStudySession,
      redeemReward, signup, login, loginWithGoogle, logout
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
