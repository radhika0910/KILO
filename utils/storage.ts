// utils/storage.ts — Robust AsyncStorage wrapper with error handling

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WEIGHT_ENTRIES: '@kilo_weight_entries',
  USER_PROFILE: '@kilo_user_profile',
  APP_SETTINGS: '@kilo_app_settings',
  ONBOARDED: '@kilo_onboarded',
} as const;

export interface WeightEntry {
  id: string;
  weight: number;
  date: string; // ISO string
  note?: string;
}

export interface UserProfile {
  name: string;
  height: number; // cm
  age: number;
  targetWeight: number;
  unit: 'kg' | 'lbs';
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  reminderEnabled: boolean;
  reminderTime: string;
  theme: 'system' | 'light' | 'dark';
}

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// ─── Weight Entries ───────────────────────────────────────────

export const getWeightEntries = async (): Promise<WeightEntry[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
    if (!json) return [];
    const entries = JSON.parse(json) as WeightEntry[];
    // Sort by date ascending
    return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('[Storage] Failed to load weight entries:', error);
    return [];
  }
};

export const saveWeightEntry = async (weight: number, note?: string): Promise<WeightEntry | null> => {
  try {
    const entries = await getWeightEntries();
    const newEntry: WeightEntry = {
      id: generateId(),
      weight,
      date: new Date().toISOString(),
      note,
    };
    const updated = [...entries, newEntry];
    await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(updated));
    return newEntry;
  } catch (error) {
    console.error('[Storage] Failed to save weight entry:', error);
    return null;
  }
};

export const deleteWeightEntry = async (id: string): Promise<boolean> => {
  try {
    const entries = await getWeightEntries();
    const updated = entries.filter((e) => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('[Storage] Failed to delete weight entry:', error);
    return false;
  }
};

export const clearAllWeightEntries = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.WEIGHT_ENTRIES);
    return true;
  } catch (error) {
    console.error('[Storage] Failed to clear weight entries:', error);
    return false;
  }
};

// ─── User Profile ─────────────────────────────────────────────

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!json) return null;
    return JSON.parse(json) as UserProfile;
  } catch (error) {
    console.error('[Storage] Failed to load user profile:', error);
    return null;
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<boolean> => {
  try {
    const updated = { ...profile, updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('[Storage] Failed to save user profile:', error);
    return false;
  }
};

// ─── Migration from old format ────────────────────────────────

export const migrateOldData = async (): Promise<boolean> => {
  try {
    const oldJson = await AsyncStorage.getItem('weightData');
    if (!oldJson) return false;

    const oldData = JSON.parse(oldJson) as Array<{
      weight: number;
      targetWeight: number;
      height: number;
      age: number;
      date: string;
      dateISO?: string;
      bmi: number;
    }>;

    if (oldData.length === 0) return false;

    // Check if already migrated
    const existingEntries = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
    if (existingEntries) return false;

    // Convert old entries to new format
    const entries: WeightEntry[] = oldData.map((old, idx) => ({
      id: generateId() + idx,
      weight: old.weight,
      date: old.dateISO || new Date(old.date).toISOString(),
    }));

    // Extract profile from last entry
    const lastOld = oldData[oldData.length - 1];
    const profile: UserProfile = {
      name: '',
      height: lastOld.height,
      age: lastOld.age,
      targetWeight: lastOld.targetWeight,
      unit: 'kg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

    // Remove old key
    await AsyncStorage.removeItem('weightData');

    console.log('[Storage] Migration complete:', entries.length, 'entries migrated');
    return true;
  } catch (error) {
    console.error('[Storage] Migration failed:', error);
    return false;
  }
};

// ─── Onboarding ───────────────────────────────────────────────

export const isOnboarded = async (): Promise<boolean> => {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED);
    return val === 'true';
  } catch {
    return false;
  }
};

export const setOnboarded = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
  } catch (error) {
    console.error('[Storage] Failed to set onboarded:', error);
  }
};

// ─── Export Data ──────────────────────────────────────────────

export const exportAllData = async (): Promise<string> => {
  try {
    const entries = await getWeightEntries();
    const profile = await getUserProfile();
    return JSON.stringify({ profile, entries, exportedAt: new Date().toISOString() }, null, 2);
  } catch (error) {
    console.error('[Storage] Failed to export data:', error);
    return '{}';
  }
};

// ─── Clear Everything ─────────────────────────────────────────

export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.WEIGHT_ENTRIES,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.APP_SETTINGS,
      STORAGE_KEYS.ONBOARDED,
    ]);
    return true;
  } catch (error) {
    console.error('[Storage] Failed to clear all data:', error);
    return false;
  }
};
