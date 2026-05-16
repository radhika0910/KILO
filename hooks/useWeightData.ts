// hooks/useWeightData.ts — Centralized data management hook

import { useCallback, useEffect, useState } from 'react';
import {
  WeightEntry,
  UserProfile,
  getWeightEntries,
  saveWeightEntry,
  deleteWeightEntry,
  clearAllWeightEntries,
  getUserProfile,
  saveUserProfile,
  migrateOldData,
} from '@/utils/storage';

interface UseWeightDataReturn {
  entries: WeightEntry[];
  profile: UserProfile | null;
  loading: boolean;
  // Entry operations
  addEntry: (weight: number, note?: string) => Promise<boolean>;
  removeEntry: (id: string) => Promise<boolean>;
  clearEntries: () => Promise<boolean>;
  // Profile operations
  updateProfile: (profile: UserProfile) => Promise<boolean>;
  // Derived data
  latestWeight: number | null;
  refresh: () => Promise<void>;
}

export const useWeightData = (): UseWeightDataReturn => {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Try migration first
      await migrateOldData();
      
      const [loadedEntries, loadedProfile] = await Promise.all([
        getWeightEntries(),
        getUserProfile(),
      ]);
      // Sort entries chronologically
      const sortedEntries = loadedEntries.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setEntries(sortedEntries);
      setProfile(loadedProfile);
    } catch (error) {
      console.error('[useWeightData] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addEntry = useCallback(async (weight: number, note?: string): Promise<boolean> => {
    const entry = await saveWeightEntry(weight, note);
    if (entry) {
      setEntries(prev => {
        const newEntries = [...prev, entry];
        return newEntries.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });
      return true;
    }
    return false;
  }, []);

  const removeEntry = useCallback(async (id: string): Promise<boolean> => {
    const success = await deleteWeightEntry(id);
    if (success) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
    return success;
  }, []);

  const clearEntries = useCallback(async (): Promise<boolean> => {
    const success = await clearAllWeightEntries();
    if (success) {
      setEntries([]);
    }
    return success;
  }, []);

  const updateProfile = useCallback(async (newProfile: UserProfile): Promise<boolean> => {
    const success = await saveUserProfile(newProfile);
    if (success) {
      setProfile(newProfile);
    }
    return success;
  }, []);

  const latestWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;

  return {
    entries,
    profile,
    loading,
    addEntry,
    removeEntry,
    clearEntries,
    updateProfile,
    latestWeight,
    refresh: loadData,
  };
};
