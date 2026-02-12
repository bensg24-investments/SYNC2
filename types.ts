
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface ClassSchedule {
  className: string;
  location?: string;
  startTime: string; 
  endTime: string;   
  days: DayOfWeek[];
}

export interface SyncHistoryEntry {
  id: string;
  name: string;
  points: number;
  timestamp: string; 
}

export interface RedemptionHistoryEntry {
  id: string;
  rewardName: string;
  cost: number;
  timestamp: string; 
}

export interface Buddy {
  id: string; // buddyUid
  name: string;
  username: string;
  sharedClasses: string[];
}

export interface StudySession {
  id: string;
  date: string; 
  duration: number; 
  pointsEarned: number;
  buddiesInvolved: string[]; 
}

export interface UserState {
  uid: string;
  name: string;
  username: string;
  email: string;
  totalPoints: number;
  dailyPoints: number;
  streak: number;
  dailyGoal: number;
  lastActiveDate: string; 
  lastCheckInDates: Record<string, string>; 
  schedule: ClassSchedule[];
  totalSessions: number;
  syncHistory: SyncHistoryEntry[];
  redemptionHistory: RedemptionHistoryEntry[];
  studyLog: StudySession[];
  dailyStudyPoints: number;
  buddies: Buddy[];
}

export interface AppContextType {
  user: UserState | null;
  loading: boolean;
  checkIn: (className: string, buddyCount?: number) => Promise<void>;
  updateDailyGoal: (goal: number) => Promise<void>;
  addClass: (newClass: ClassSchedule) => Promise<void>;
  removeClass: (className: string) => Promise<void>;
  editClass: (oldClassName: string, updatedClass: ClassSchedule) => Promise<void>;
  getInitials: () => string;
  updateSettings: (email: string, name: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  performGroupSync: (targetUid: string) => Promise<void>;
  logStudySession: (minutes: number, selectedBuddyIds: string[]) => Promise<void>;
  redeemReward: (rewardName: string, cost: number) => Promise<boolean>;
  // Auth methods
  signup: (email: string, password: string, name: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}
