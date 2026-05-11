// components/ui/InsightCard.tsx — Insight display card

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography, Radius, Shadows, Spacing } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface InsightCardProps {
  icon: string;
  title: string;
  description: string;
  value?: string;
  accentColor?: string;
}

export default function InsightCard({
  icon,
  title,
  description,
  value,
  accentColor,
}: InsightCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const accent = accentColor || theme.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: accent + '15' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>

      {value && (
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: accent }]}>{value}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    marginBottom: 2,
  },
  description: {
    ...Typography.caption,
  },
  valueContainer: {
    marginLeft: Spacing.sm,
  },
  value: {
    ...Typography.heading3,
  },
});
