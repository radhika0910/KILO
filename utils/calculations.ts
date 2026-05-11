// utils/calculations.ts — BMI, trend analysis, predictions

import { WeightEntry, UserProfile } from './storage';

// ─── BMI ──────────────────────────────────────────────────────

export const calculateBMI = (weightKg: number, heightCm: number): number => {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

export type BMICategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export const getBMICategory = (bmi: number): BMICategory => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const getBMICategoryColor = (bmi: number, isDark: boolean): string => {
  const category = getBMICategory(bmi);
  switch (category) {
    case 'Underweight': return isDark ? '#60A5FA' : '#3B82F6';
    case 'Normal': return isDark ? '#34D399' : '#10B981';
    case 'Overweight': return isDark ? '#FBBF24' : '#F59E0B';
    case 'Obese': return isDark ? '#F87171' : '#EF4444';
  }
};

export const getBMIAdvice = (bmi: number): string => {
  const category = getBMICategory(bmi);
  switch (category) {
    case 'Underweight': return 'Consider a nutrient-rich diet to reach a healthy weight.';
    case 'Normal': return 'Great job! Maintain your current lifestyle.';
    case 'Overweight': return 'Small changes in diet and exercise can help reach your goal.';
    case 'Obese': return 'Consult a healthcare provider for a personalized plan.';
  }
};

// ─── Streaks ──────────────────────────────────────────────────

export const calculateStreak = (entries: WeightEntry[]): number => {
  if (entries.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get unique dates (sorted descending)
  const uniqueDates = [...new Set(
    entries.map(e => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  )].sort((a, b) => b - a);

  // Check if most recent entry is today or yesterday
  const mostRecent = uniqueDates[0];
  const dayDiff = Math.floor((today.getTime() - mostRecent) / (1000 * 60 * 60 * 24));
  if (dayDiff > 1) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = Math.floor((uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// ─── Trends ───────────────────────────────────────────────────

export type TrendDirection = 'losing' | 'gaining' | 'maintaining';

export const getWeeklyTrend = (entries: WeightEntry[]): { direction: TrendDirection; change: number } => {
  if (entries.length < 2) return { direction: 'maintaining', change: 0 };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentEntries = entries.filter(e => new Date(e.date) >= weekAgo);
  if (recentEntries.length < 2) {
    // Use last 2 entries
    const last = entries[entries.length - 1];
    const prev = entries[entries.length - 2];
    const change = parseFloat((last.weight - prev.weight).toFixed(1));
    return {
      direction: Math.abs(change) < 0.2 ? 'maintaining' : change < 0 ? 'losing' : 'gaining',
      change,
    };
  }

  const first = recentEntries[0];
  const last = recentEntries[recentEntries.length - 1];
  const change = parseFloat((last.weight - first.weight).toFixed(1));

  return {
    direction: Math.abs(change) < 0.2 ? 'maintaining' : change < 0 ? 'losing' : 'gaining',
    change,
  };
};

// ─── Predictions ──────────────────────────────────────────────

export const predictGoalDate = (
  entries: WeightEntry[],
  targetWeight: number
): Date | null => {
  if (entries.length < 3) return null;

  // Use last 14 days of data for trend
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const recent = entries.filter(e => new Date(e.date) >= twoWeeksAgo);

  if (recent.length < 2) return null;

  const first = recent[0];
  const last = recent[recent.length - 1];
  const daysDiff = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff === 0) return null;

  const ratePerDay = (last.weight - first.weight) / daysDiff;
  const currentWeight = last.weight;
  const remaining = targetWeight - currentWeight;

  // Check if moving in the right direction
  if (ratePerDay === 0) return null;
  if ((remaining < 0 && ratePerDay > 0) || (remaining > 0 && ratePerDay < 0)) return null;

  const daysToGoal = Math.abs(remaining / ratePerDay);
  if (daysToGoal > 365 * 3) return null; // Cap at 3 years

  const goalDate = new Date(now.getTime() + daysToGoal * 24 * 60 * 60 * 1000);
  return goalDate;
};

// ─── Progress ─────────────────────────────────────────────────

export const getProgressPercentage = (
  startWeight: number,
  currentWeight: number,
  targetWeight: number
): number => {
  const totalChange = Math.abs(startWeight - targetWeight);
  if (totalChange === 0) return 100;
  const achieved = Math.abs(startWeight - currentWeight);
  const pct = Math.min(100, Math.max(0, (achieved / totalChange) * 100));
  return parseFloat(pct.toFixed(1));
};

// ─── Stats ────────────────────────────────────────────────────

export const getWeightStats = (entries: WeightEntry[]) => {
  if (entries.length === 0) {
    return { highest: 0, lowest: 0, average: 0, total: 0, totalChange: 0 };
  }

  const weights = entries.map(e => e.weight);
  const highest = Math.max(...weights);
  const lowest = Math.min(...weights);
  const average = parseFloat((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1));
  const totalChange = parseFloat((weights[weights.length - 1] - weights[0]).toFixed(1));

  return { highest, lowest, average, total: entries.length, totalChange };
};

// ─── Filter by time range ─────────────────────────────────────

export type TimeRange = 'week' | 'month' | '3months' | '6months' | 'year' | 'all';

export const filterByTimeRange = (entries: WeightEntry[], range: TimeRange): WeightEntry[] => {
  if (range === 'all') return entries;

  const now = new Date();
  let from = new Date();

  switch (range) {
    case 'week': from.setDate(now.getDate() - 7); break;
    case 'month': from.setMonth(now.getMonth() - 1); break;
    case '3months': from.setMonth(now.getMonth() - 3); break;
    case '6months': from.setMonth(now.getMonth() - 6); break;
    case 'year': from.setFullYear(now.getFullYear() - 1); break;
  }

  return entries.filter(e => new Date(e.date) >= from);
};

// ─── Milestones ───────────────────────────────────────────────

export interface Milestone {
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
}

export const getMilestones = (entries: WeightEntry[], profile: UserProfile | null): Milestone[] => {
  const milestones: Milestone[] = [];

  // First log
  milestones.push({
    title: 'First Step',
    description: 'Logged your first weight entry',
    icon: '🎯',
    achieved: entries.length >= 1,
  });

  // 7-day streak
  const streak = calculateStreak(entries);
  milestones.push({
    title: 'Week Warrior',
    description: '7-day logging streak',
    icon: '🔥',
    achieved: streak >= 7,
  });

  // 30 entries
  milestones.push({
    title: 'Committed',
    description: '30 weight entries logged',
    icon: '💪',
    achieved: entries.length >= 30,
  });

  // 1kg lost (if target is lower)
  if (profile && entries.length >= 2) {
    const first = entries[0].weight;
    const current = entries[entries.length - 1].weight;
    const change = first - current;

    if (profile.targetWeight < first) {
      milestones.push({
        title: 'First Kilo Down',
        description: 'Lost your first kilogram',
        icon: '⬇️',
        achieved: change >= 1,
      });

      milestones.push({
        title: '5 Kilos Down',
        description: 'Lost 5 kilograms total',
        icon: '🏆',
        achieved: change >= 5,
      });
    } else {
      milestones.push({
        title: 'First Kilo Up',
        description: 'Gained your first kilogram',
        icon: '⬆️',
        achieved: change <= -1,
      });
    }
  }

  // 100 entries
  milestones.push({
    title: 'Centurion',
    description: '100 weight entries logged',
    icon: '💎',
    achieved: entries.length >= 100,
  });

  return milestones;
};
