// hooks/useInsights.ts — Smart insights computation

import { useMemo } from 'react';
import { WeightEntry, UserProfile } from '@/utils/storage';
import {
  calculateBMI,
  getBMICategory,
  getBMIAdvice,
  calculateStreak,
  getWeeklyTrend,
  predictGoalDate,
  getProgressPercentage,
  getWeightStats,
  getMilestones,
  TrendDirection,
  BMICategory,
  Milestone,
} from '@/utils/calculations';

export interface InsightData {
  bmi: number;
  bmiCategory: BMICategory;
  bmiAdvice: string;
  streak: number;
  trend: { direction: TrendDirection; change: number };
  goalDate: Date | null;
  progress: number;
  stats: {
    highest: number;
    lowest: number;
    average: number;
    total: number;
    totalChange: number;
  };
  milestones: Milestone[];
  distanceToGoal: number;
  motivationalMessage: string;
}

export const useInsights = (entries: WeightEntry[], profile: UserProfile | null): InsightData => {
  return useMemo(() => {
    const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : 0;
    const height = profile?.height || 170;
    const targetWeight = profile?.targetWeight || currentWeight;
    const startWeight = entries.length > 0 ? entries[0].weight : currentWeight;

    const bmi = calculateBMI(currentWeight, height);
    const bmiCategory = getBMICategory(bmi);
    const bmiAdvice = getBMIAdvice(bmi);
    const streak = calculateStreak(entries);
    const trend = getWeeklyTrend(entries);
    const goalDate = predictGoalDate(entries, targetWeight);
    const progress = getProgressPercentage(startWeight, currentWeight, targetWeight);
    const stats = getWeightStats(entries);
    const milestones = getMilestones(entries, profile);
    const distanceToGoal = parseFloat(Math.abs(currentWeight - targetWeight).toFixed(1));

    // Generate motivational message
    let motivationalMessage = '';
    if (entries.length === 0) {
      motivationalMessage = 'Start your journey today! Log your first weight.';
    } else if (distanceToGoal < 1) {
      motivationalMessage = '🎉 You\'re almost at your goal! Keep going!';
    } else if (streak >= 7) {
      motivationalMessage = `🔥 ${streak}-day streak! You\'re unstoppable!`;
    } else if (trend.direction === 'losing' && targetWeight < currentWeight) {
      motivationalMessage = `📉 Down ${Math.abs(trend.change)}kg this week. Incredible progress!`;
    } else if (trend.direction === 'gaining' && targetWeight > currentWeight) {
      motivationalMessage = `📈 Up ${trend.change}kg this week. Gaining strength!`;
    } else if (progress > 50) {
      motivationalMessage = `💪 ${progress.toFixed(0)}% of the way to your goal!`;
    } else if (streak >= 3) {
      motivationalMessage = `⚡ ${streak}-day streak! Consistency is key.`;
    } else {
      motivationalMessage = 'Every step counts. Keep logging your progress! 💜';
    }

    return {
      bmi,
      bmiCategory,
      bmiAdvice,
      streak,
      trend,
      goalDate,
      progress,
      stats,
      milestones,
      distanceToGoal,
      motivationalMessage,
    };
  }, [entries, profile]);
};
