// components/ui/StreakBadge.tsx — Animated streak counter

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography, Radius, Shadows, Spacing } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface StreakBadgeProps {
  streak: number;
  compact?: boolean;
}

export default function StreakBadge({ streak, compact = false }: StreakBadgeProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getStreakEmoji = () => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '💜';
  };

  const getStreakColor = () => {
    if (streak >= 30) return '#F59E0B';
    if (streak >= 14) return '#EF4444';
    if (streak >= 7) return '#F97316';
    if (streak >= 3) return theme.primary;
    return theme.textSecondary;
  };

  const color = getStreakColor();

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: color + '15', borderColor: color + '30' }]}>
        <Text style={styles.compactEmoji}>{getStreakEmoji()}</Text>
        <Text style={[styles.compactValue, { color }]}>{streak}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={[styles.emojiContainer, { backgroundColor: color + '15' }]}>
        <Text style={styles.emoji}>{getStreakEmoji()}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.value, { color }]}>{streak}</Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {streak === 1 ? 'day' : 'days'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  emoji: {
    fontSize: 22,
  },
  textContainer: {
    alignItems: 'center',
  },
  value: {
    ...Typography.statSmall,
    lineHeight: 28,
  },
  label: {
    ...Typography.caption,
    marginTop: -2,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  compactEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  compactValue: {
    ...Typography.captionMedium,
  },
});
