// components/ui/StatCard.tsx — Glassmorphism stat card

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography, Radius, Shadows, Spacing } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon?: string;
  accentColor?: string;
  compact?: boolean;
}

export default function StatCard({ label, value, unit, icon, accentColor, compact = false }: StatCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const accent = accentColor || theme.primary;

  return (
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          shadowColor: accent,
        },
      ]}
    >
      {/* Accent top line */}
      <View style={[styles.accentLine, { backgroundColor: accent }]} />

      {icon && <Text style={styles.icon}>{icon}</Text>}

      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>

      <View style={styles.valueRow}>
        <Text 
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            compact ? styles.valueCompact : styles.value, 
            { color: theme.text },
            typeof value === 'string' && value.length > 8 && { fontSize: compact ? 16 : 20 }
          ]}
        >
          {value}
        </Text>
        {unit && (
          <Text style={[styles.unit, { color: theme.textSecondary }]}>{unit}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardCompact: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  icon: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.label,
    marginBottom: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...Typography.stat,
  },
  valueCompact: {
    ...Typography.statSmall,
  },
  unit: {
    ...Typography.caption,
    marginLeft: 4,
  },
});
