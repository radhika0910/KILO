// app/(tabs)/progress.tsx — Weight Progress & Charts Tab

import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn, FadeInRight } from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { Typography, Radius, Shadows, Spacing } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWeightData } from '@/hooks/useWeightData';
import { useInsights } from '@/hooks/useInsights';
import WeightChart from '@/components/ui/WeightChart';
import StatCard from '@/components/ui/StatCard';
import { filterByTimeRange, TimeRange } from '@/utils/calculations';

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'week', label: '1W' },
  { key: 'month', label: '1M' },
  { key: '3months', label: '3M' },
  { key: '6months', label: '6M' },
  { key: 'year', label: '1Y' },
  { key: 'all', label: 'All' },
];

export default function ProgressScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { entries, profile, removeEntry } = useWeightData();
  const insights = useInsights(entries, profile);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const filteredEntries = filterByTimeRange(entries, timeRange);

  const handleDeleteEntry = (id: string, weight: number) => {
    Alert.alert(
      'Delete Entry',
      `Remove ${weight} kg entry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await removeEntry(id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      {/* Decorative Background Elements */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View 
          entering={FadeIn.delay(400).duration(2000)}
          style={[styles.glowCircle, { top: -50, right: -100, backgroundColor: theme.info + '15' }]} 
        />
        <Animated.View 
          entering={FadeIn.delay(900).duration(2000)}
          style={[styles.glowCircle, { bottom: 200, left: -80, backgroundColor: theme.accent + '15', width: 250, height: 250 }]} 
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          {/* Section Title */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Weight Progress
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Visualize your journey over time
          </Text>
        </Animated.View>

        {/* Time Range Selector */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.rangeSelector, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          {TIME_RANGES.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => {
                Haptics.selectionAsync();
                setTimeRange(key);
              }}
              style={[
                styles.rangeButton,
                timeRange === key && {
                  backgroundColor: theme.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.rangeLabel,
                  { color: timeRange === key ? '#fff' : theme.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Chart */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <WeightChart
            entries={filteredEntries}
            targetWeight={profile?.targetWeight}
            height={220}
          />
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.statsRow}
        >
          <StatCard
            label="HIGHEST"
            value={insights.stats.highest > 0 ? insights.stats.highest.toString() : '--'}
            unit="kg"
            icon="📈"
            accentColor={theme.warning}
            compact
          />
          <View style={{ width: Spacing.md }} />
          <StatCard
            label="LOWEST"
            value={insights.stats.lowest > 0 ? insights.stats.lowest.toString() : '--'}
            unit="kg"
            icon="📉"
            accentColor={theme.success}
            compact
          />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(500).duration(600)}
          style={styles.statsRow}
        >
          <StatCard
            label="AVERAGE"
            value={insights.stats.average > 0 ? insights.stats.average.toString() : '--'}
            unit="kg"
            icon="📊"
            accentColor={theme.info}
            compact
          />
          <View style={{ width: Spacing.md }} />
          <StatCard
            label="CHANGE"
            value={insights.stats.totalChange !== 0
              ? `${insights.stats.totalChange > 0 ? '+' : ''}${insights.stats.totalChange}`
              : '--'}
            unit="kg"
            icon={insights.stats.totalChange <= 0 ? '⬇️' : '⬆️'}
            accentColor={insights.stats.totalChange <= 0 ? theme.success : theme.warning}
            compact
          />
        </Animated.View>

        {/* Full History */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(600)}
          style={styles.historyHeader}
        >
          <Text style={[styles.historyTitle, { color: theme.text }]}>
            All Entries
          </Text>
          <Text style={[styles.historyCount, { color: theme.textSecondary }]}>
            {entries.length} entries
          </Text>
        </Animated.View>

        {[...entries].reverse().map((entry, idx) => {
          const d = new Date(entry.date);
          const isToday = new Date().toDateString() === d.toDateString();
          const prevEntry = entries.length > 1 && idx < entries.length - 1
            ? [...entries].reverse()[idx + 1]
            : null;
          const diff = prevEntry
            ? parseFloat((entry.weight - prevEntry.weight).toFixed(1))
            : null;

          return (
            <Animated.View
              key={entry.id}
              entering={FadeInRight.delay(700 + idx * 50).duration(500)}
            >
              <TouchableOpacity
                onLongPress={() => handleDeleteEntry(entry.id, entry.weight)}
                delayLongPress={500}
                activeOpacity={0.7}
                style={[
                  styles.historyItem,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.historyLeft}>
                  <View style={[styles.historyTimeline, { backgroundColor: theme.primary + '30' }]}>
                    <View style={[styles.historyDot, { backgroundColor: theme.primary }]} />
                  </View>
                  <View>
                    <Text style={[styles.historyWeight, { color: theme.text }]}>
                      {entry.weight} kg
                    </Text>
                    <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                      {isToday ? 'Today' : d.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' · '}
                      {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {entry.note && (
                      <Text style={[styles.historyNote, { color: theme.textSecondary }]}>
                        📝 {entry.note}
                      </Text>
                    )}
                  </View>
                </View>

                {diff !== null && diff !== 0 && (
                  <Text
                    style={[
                      styles.historyDiff,
                      { color: diff < 0 ? theme.success : theme.warning },
                    ]}
                  >
                    {diff > 0 ? '+' : ''}{diff}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {entries.length === 0 && (
          <Animated.View 
            entering={FadeInDown.delay(700).duration(600)}
            style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          >
            <Text style={styles.emptyEmoji}>📈</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Start logging to see your progress
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
  },

  // Section
  sectionTitle: {
    ...Typography.heading2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...Typography.caption,
    marginBottom: Spacing.xl,
  },

  // Range selector
  rangeSelector: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  rangeLabel: {
    ...Typography.captionMedium,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },

  // History
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  historyTitle: {
    ...Typography.heading3,
  },
  historyCount: {
    ...Typography.caption,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyTimeline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyWeight: {
    ...Typography.bodyMedium,
  },
  historyDate: {
    ...Typography.caption,
    marginTop: 2,
  },
  historyNote: {
    ...Typography.caption,
    marginTop: 4,
    fontStyle: 'italic',
  },
  historyDiff: {
    ...Typography.captionMedium,
    marginLeft: Spacing.sm,
  },

  // Empty
  emptyState: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.xxxl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.4,
  },
});
