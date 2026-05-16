// app/(tabs)/insights.tsx — Smart Insights Tab (USP)

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { Typography, Radius, Shadows, Spacing } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWeightData } from '@/hooks/useWeightData';
import { useInsights } from '@/hooks/useInsights';
import InsightCard from '@/components/ui/InsightCard';
import StreakBadge from '@/components/ui/StreakBadge';
import { getBMICategoryColor } from '@/utils/calculations';

export default function InsightsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const { entries, profile } = useWeightData();
  const insights = useInsights(entries, profile);

  const goalDate = insights.goalDate;
  const goalDateStr = goalDate
    ? goalDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const daysToGoal = goalDate
    ? Math.ceil((goalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      {/* Decorative Background Elements */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View 
          entering={FadeIn.delay(300).duration(2000)}
          style={[styles.glowCircle, { top: 100, right: -50, backgroundColor: theme.accent + '15' }]} 
        />
        <Animated.View 
          entering={FadeIn.delay(800).duration(2000)}
          style={[styles.glowCircle, { bottom: -100, left: -50, backgroundColor: theme.primary + '20' }]} 
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Smart Insights
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            AI-powered analysis of your weight journey
          </Text>
        </Animated.View>

        {/* Motivational Banner */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.motivBanner, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}
        >
          <Text style={styles.motivEmoji}>💜</Text>
          <Text style={[styles.motivText, { color: theme.text }]}>
            {insights.motivationalMessage}
          </Text>
        </Animated.View>

        {/* Streak Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text style={[styles.groupTitle, { color: theme.text }]}>🔥 Your Streak</Text>
          <View style={[styles.streakContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <StreakBadge streak={insights.streak} />
            <View style={styles.streakInfo}>
              <Text style={[styles.streakLabel, { color: theme.text }]}>
                {insights.streak === 0
                  ? 'Start your streak today!'
                  : insights.streak === 1
                  ? "Great start! Come back tomorrow."
                  : insights.streak < 7
                  ? `${7 - insights.streak} more days for Week Warrior!`
                  : insights.streak < 30
                  ? `${30 - insights.streak} days to Centurion badge!`
                  : "You're a legend! Keep it going!"}
              </Text>
              <View style={styles.streakDots}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.streakDot,
                      {
                        backgroundColor: i < Math.min(insights.streak, 7)
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Body Analysis */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text style={[styles.groupTitle, { color: theme.text }]}>📊 Body Analysis</Text>

          <InsightCard
            icon="⚖️"
            title={`BMI: ${insights.bmi > 0 ? insights.bmi : '--'}`}
            description={insights.bmi > 0 ? insights.bmiCategory : 'Log weight to calculate'}
            accentColor={insights.bmi > 0 ? getBMICategoryColor(insights.bmi, isDark) : undefined}
          />

          {insights.bmi > 0 && (
            <View style={[styles.adviceCard, { backgroundColor: getBMICategoryColor(insights.bmi, isDark) + '10', borderColor: getBMICategoryColor(insights.bmi, isDark) + '30' }]}>
              <Text style={[styles.adviceText, { color: theme.text }]}>
                💡 {insights.bmiAdvice}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Trend */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)}>
          <Text style={[styles.groupTitle, { color: theme.text }]}>📈 Weekly Trend</Text>

          <InsightCard
            icon={
              insights.trend.direction === 'losing' ? '📉' :
              insights.trend.direction === 'gaining' ? '📈' : '➡️'
            }
            title={
              insights.trend.direction === 'losing' ? 'Losing Weight' :
              insights.trend.direction === 'gaining' ? 'Gaining Weight' : 'Maintaining'
            }
            description={
              insights.trend.change !== 0
                ? `${Math.abs(insights.trend.change)} kg change this week`
                : 'Your weight has been stable'
            }
            value={
              insights.trend.change !== 0
                ? `${insights.trend.change > 0 ? '+' : ''}${insights.trend.change}`
                : '—'
            }
            accentColor={
              insights.trend.direction === 'losing' ? theme.success :
              insights.trend.direction === 'gaining' ? theme.warning : theme.info
            }
          />
        </Animated.View>

        {/* Goal Prediction */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <Text style={[styles.groupTitle, { color: theme.text }]}>🎯 Goal Prediction</Text>

          {goalDateStr && daysToGoal ? (
            <InsightCard
              icon="🗓️"
              title={`Estimated: ${goalDateStr}`}
              description={`Based on your current trajectory (~${daysToGoal} days)`}
              accentColor={theme.accent}
            />
          ) : (
            <InsightCard
              icon="🔮"
              title="Not enough data"
              description="Log consistently for at least 2 weeks to get a prediction"
              accentColor={theme.textSecondary}
            />
          )}

          <InsightCard
            icon="🏁"
            title={`${insights.distanceToGoal} kg to goal`}
            description={`${insights.progress.toFixed(0)}% of the way there`}
            value={`${insights.progress.toFixed(0)}%`}
            accentColor={insights.progress >= 50 ? theme.success : theme.primary}
          />
        </Animated.View>

        {/* Milestones */}
        <Animated.View entering={FadeInDown.delay(700).duration(600)}>
          <Text style={[styles.groupTitle, { color: theme.text }]}>🏆 Milestones</Text>

          {insights.milestones.map((milestone, idx) => (
            <Animated.View
              key={idx}
              entering={FadeInDown.delay(800 + idx * 50).duration(500)}
              style={[
                styles.milestoneItem,
                {
                  backgroundColor: milestone.achieved ? theme.card : theme.background + '50',
                  borderColor: milestone.achieved ? theme.primary + '30' : theme.cardBorder,
                  opacity: milestone.achieved ? 1 : 0.6,
                },
              ]}
            >
              <Text style={styles.milestoneIcon}>
                {milestone.achieved ? milestone.icon : '🔒'}
              </Text>
              <View style={styles.milestoneContent}>
                <Text
                  style={[
                    styles.milestoneTitle,
                    { color: milestone.achieved ? theme.text : theme.textSecondary },
                  ]}
                >
                  {milestone.title}
                </Text>
                <Text style={[styles.milestoneDesc, { color: theme.textSecondary }]}>
                  {milestone.description}
                </Text>
              </View>
              {milestone.achieved && (
                <Text style={styles.milestoneCheck}>✅</Text>
              )}
            </Animated.View>
          ))}
        </Animated.View>

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(900).duration(600)}>
          <Text style={[styles.groupTitle, { color: theme.text }]}>💡 Quick Tips</Text>

          {[
            { icon: '🥗', text: 'Eat mindfully — focus on whole foods rich in fiber and protein.' },
            { icon: '💧', text: 'Stay hydrated — aim for 8 glasses of water daily.' },
            { icon: '😴', text: 'Sleep 7-9 hours — poor sleep can affect weight regulation.' },
            { icon: '🚶', text: 'Move daily — even a 30-min walk makes a difference.' },
            { icon: '📝', text: 'Log consistently — tracking builds awareness and accountability.' },
          ].map((tip, i) => (
            <View
              key={i}
              style={[styles.tipItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            >
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={[styles.tipText, { color: theme.text }]}>{tip.text}</Text>
            </View>
          ))}
        </Animated.View>

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
  sectionTitle: {
    ...Typography.heading2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...Typography.caption,
    marginBottom: Spacing.xl,
  },
  groupTitle: {
    ...Typography.heading3,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },

  // Motivational banner
  motivBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  motivEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  motivText: {
    ...Typography.bodyMedium,
    flex: 1,
  },

  // Streak
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  streakInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  streakLabel: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  streakDots: {
    flexDirection: 'row',
    gap: 6,
  },
  streakDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Advice
  adviceCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  adviceText: {
    ...Typography.caption,
    lineHeight: 20,
  },

  // Milestones
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  milestoneIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    ...Typography.bodyMedium,
  },
  milestoneDesc: {
    ...Typography.caption,
    marginTop: 2,
  },
  milestoneCheck: {
    fontSize: 16,
    marginLeft: Spacing.sm,
  },

  // Tips
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  tipText: {
    ...Typography.caption,
    flex: 1,
    lineHeight: 20,
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.4,
  },
});
