'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sounds } from './sounds';

interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  unlockedBadges: string[];
  lastActiveDate: string | null;
  addXp: (amount: number, reason: string) => { leveledUp: boolean };
  setUserState: (streak: number, xp?: number) => void;
  incrementStreak: () => void;
  unlockBadge: (badgeId: string) => boolean;
  resetProgress: () => void;
}

// Level bounds: 1000 XP per level
const XP_PER_LEVEL = 1000;

const ALL_BADGES = [
  { id: 'first_scan', label: 'First Scan', desc: 'Analyzed your first resume ATS score' },
  { id: 'roadmap_create', label: 'Path Finder', desc: 'Generated your first AI learning roadmap' },
  { id: 'streak_5', label: 'Streak Scholar', desc: 'Maintained a 5-day coding tracker consistency' },
  { id: 'interview_pass', label: 'Mock Expert', desc: 'Achieved >8.0 in an AI technical interview round' }
];

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0, // 0 start XP for brand new user
      level: 1,
      streak: 0, // 0 start streak for brand new user
      unlockedBadges: [],
      lastActiveDate: null,

      setUserState: (streak: number, xp?: number) => {
        set((prev) => ({
          streak: streak >= 0 ? streak : prev.streak,
          xp: xp !== undefined ? xp : prev.xp,
          level: xp !== undefined ? Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1) : prev.level,
        }));
      },

      addXp: (amount: number, reason: string) => {
        const state = get();
        let newXp = state.xp + amount;
        let newLevel = state.level;
        let leveledUp = false;

        // Calculate Level Up
        const targetXp = newLevel * XP_PER_LEVEL;
        if (newXp >= targetXp) {
          newLevel += 1;
          leveledUp = true;
          sounds.playChime(); // Play synthesized victory level chime!
        } else {
          sounds.playToggle(); // Play minor status tick!
        }

        set({ xp: newXp, level: newLevel });
        return { leveledUp };
      },

      incrementStreak: () => {
        const state = get();
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (state.lastActiveDate === todayStr) return; // already ticked today
        
        let newStreak = state.streak;
        if (state.lastActiveDate) {
          const lastDate = new Date(state.lastActiveDate);
          const diffTime = Math.abs(new Date(todayStr).getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1; // reset streak if broken
          }
        } else {
          newStreak = 1;
        }

        set({ streak: newStreak, lastActiveDate: todayStr });
        
        // Trigger badge unlock for 5-day streak
        if (newStreak === 5) {
          get().unlockBadge('streak_5');
        }
      },

      unlockBadge: (badgeId: string) => {
        const state = get();
        if (state.unlockedBadges.includes(badgeId)) return false;

        const newBadges = [...state.unlockedBadges, badgeId];
        set({ unlockedBadges: newBadges });
        sounds.playChime(); // Play unlock chime!
        return true;
      },

      resetProgress: () => {
        set({
          xp: 250,
          level: 1,
          streak: 3,
          unlockedBadges: [],
          lastActiveDate: null
        });
      }
    }),
    {
      name: 'pathforge-career-os-gamification',
    }
  )
);
export default useGamificationStore;
