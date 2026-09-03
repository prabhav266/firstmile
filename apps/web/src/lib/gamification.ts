'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sounds } from './sounds';

interface GamificationState {
  currentUserId: string | null;
  xp: number;
  level: number;
  streak: number;
  unlockedBadges: string[];
  lastActiveDate: string | null;
  syncUser: (userId: string) => void;
  addXp: (amount: number, reason: string) => { leveledUp: boolean };
  setUserState: (streak: number, xp?: number) => void;
  incrementStreak: () => void;
  unlockBadge: (badgeId: string) => boolean;
  resetProgress: () => void;
}

// Level bounds: 1000 XP per level
const XP_PER_LEVEL = 1000;

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      xp: 0,
      level: 1,
      streak: 0,
      unlockedBadges: [],
      lastActiveDate: null,

      // Sync state per user ID so switching accounts never bleeds XP/streak
      syncUser: (userId: string) => {
        const state = get();
        if (state.currentUserId !== userId) {
          set({
            currentUserId: userId,
            xp: 0,
            level: 1,
            streak: 0,
            unlockedBadges: [],
            lastActiveDate: null,
          });
        }
      },

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
          sounds.playChime();
        } else {
          sounds.playToggle();
        }

        set({ xp: newXp, level: newLevel });
        return { leveledUp };
      },

      incrementStreak: () => {
        const state = get();
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (state.lastActiveDate === todayStr) return;
        
        let newStreak = state.streak;
        if (state.lastActiveDate) {
          const lastDate = new Date(state.lastActiveDate);
          const diffTime = Math.abs(new Date(todayStr).getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        set({ streak: newStreak, lastActiveDate: todayStr });
      },

      unlockBadge: (badgeId: string) => {
        const state = get();
        if (state.unlockedBadges.includes(badgeId)) return false;

        const newBadges = [...state.unlockedBadges, badgeId];
        set({ unlockedBadges: newBadges });
        sounds.playChime();
        return true;
      },

      resetProgress: () => {
        set({
          currentUserId: null,
          xp: 0,
          level: 1,
          streak: 0,
          unlockedBadges: [],
          lastActiveDate: null,
        });
      },
    }),
    {
      name: 'pathforge-career-os-gamification',
    }
  )
);
export default useGamificationStore;
