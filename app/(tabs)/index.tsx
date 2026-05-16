// app/(tabs)/index.tsx — KILO Dashboard (Home Tab)

import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

import ProgressRing from '@/components/ui/ProgressRing';
import StatCard from '@/components/ui/StatCard';
import StreakBadge from '@/components/ui/StreakBadge';
import Confetti from '@/components/ui/Confetti';
import StatusModal from '@/components/ui/StatusModal';
import { Colors } from '@/constants/Colors';
import { Radius, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useInsights } from '@/hooks/useInsights';
import { useWeightData } from '@/hooks/useWeightData';
import { calculateBMI, getBMICategoryColor } from '@/utils/calculations';
import { saveUserProfile, saveWeightEntry } from '@/utils/storage';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const { entries, profile, loading, addEntry, refresh } = useWeightData();
  const insights = useInsights(entries, profile);

  const [modalVisible, setModalVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Check if user needs onboarding
  const needsOnboarding = !profile;
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    height: '',
    age: '',
    targetWeight: '',
    currentWeight: '',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleQuickLog = async () => {
    const weight = parseFloat(weightInput);
    if (!weight || weight < 20 || weight > 300) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight between 20-300 kg.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await addEntry(weight, noteInput || undefined);
    if (success) {
      setWeightInput('');
      setNoteInput('');
      setModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Check for Goal Achievement
      if (profile && weight <= profile.targetWeight) {
        setTimeout(() => {
          setShowConfetti(true);
          setShowGoalModal(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 600);
      }
    } else {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  };

  const handleRateApp = () => {
    setShowGoalModal(false);
    // Open Play Store / App Store link
    const url = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/id123456789' // Replace with real ID
      : 'market://details?id=com.radhika0910.kilo';
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open store link.');
    });
  };

  const handleOnboard = async () => {
    const height = parseFloat(onboardForm.height);
    const age = parseInt(onboardForm.age);
    const targetWeight = parseFloat(onboardForm.targetWeight);
    const currentWeight = parseFloat(onboardForm.currentWeight);

    if (!height || !age || !targetWeight || !currentWeight) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    if (height < 50 || height > 250) {
      Alert.alert('Invalid Height', 'Please enter height between 50-250 cm.');
      return;
    }

    const profileData = {
      name: onboardForm.name || 'User',
      height,
      age,
      targetWeight,
      unit: 'kg' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveUserProfile(profileData);
    await saveWeightEntry(currentWeight);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await refresh();
  };

  const latestWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;
  const prevWeight = entries.length > 1 ? entries[entries.length - 2].weight : null;
  const weightDiff = latestWeight && prevWeight ? parseFloat((latestWeight - prevWeight).toFixed(1)) : null;

  const pulse1 = useSharedValue(1);
  const pulse2 = useSharedValue(1);

  React.useEffect(() => {
    pulse1.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 6000 }), withTiming(1, { duration: 6000 })),
      -1,
      true
    );
    pulse2.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 8000 }), withTiming(0.95, { duration: 8000 })),
      -1,
      true
    );
  }, []);

  const glowStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse1.value }],
    opacity: 0.08 + (pulse1.value - 1) * 0.1, 
  }));

  const glowStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse2.value }],
    opacity: 0.05 + (pulse2.value - 1) * 0.08,
  }));

  // ─── Onboarding Screen ─────────────────────────────────────

  if (needsOnboarding && !loading) {
    return (
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        {/* Decorative Background Elements */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View style={[styles.glowCircle, glowStyle1, { top: -50, right: -100, backgroundColor: theme.primary }]} />
          <Animated.View style={[styles.glowCircle, glowStyle2, { bottom: -100, left: -50, backgroundColor: theme.accent }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.onboardContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <Text style={styles.onboardEmoji}>🏋️</Text>
            <View style={styles.onboardHeaderRow}>
              <Image 
                source={require('@/assets/images/logo.png')} 
                style={styles.onboardLogo} 
                resizeMode="contain"
              />
              <Text style={[styles.onboardTitle, { color: theme.text }]}>
                Welcome to KILO
              </Text>
            </View>
            <Text style={[styles.onboardSubtitle, { color: theme.textSecondary }]}>
              Let's set up your profile to get started
            </Text>
          </Animated.View>

          <View style={styles.onboardForm}>
            <Animated.View entering={FadeInDown.delay(200).duration(600)}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>YOUR NAME</Text>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                placeholder="e.g. Radhika"
                placeholderTextColor={theme.icon}
                value={onboardForm.name}
                onChangeText={(v) => setOnboardForm(p => ({ ...p, name: v }))}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(600)}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>CURRENT WEIGHT (KG)</Text>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                placeholder="e.g. 70"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
                value={onboardForm.currentWeight}
                onChangeText={(v) => setOnboardForm(p => ({ ...p, currentWeight: v }))}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>TARGET WEIGHT (KG)</Text>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                placeholder="e.g. 60"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
                value={onboardForm.targetWeight}
                onChangeText={(v) => setOnboardForm(p => ({ ...p, targetWeight: v }))}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(600)}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>HEIGHT (CM)</Text>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                placeholder="e.g. 165"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
                value={onboardForm.height}
                onChangeText={(v) => setOnboardForm(p => ({ ...p, height: v }))}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(600)}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>AGE</Text>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                placeholder="e.g. 25"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
                value={onboardForm.age}
                onChangeText={(v) => setOnboardForm(p => ({ ...p, age: v }))}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(700).duration(600)}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: Spacing.xl }]}
                onPress={handleOnboard}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Start My Journey 🚀</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Main Dashboard ─────────────────────────────────────────

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      {/* Decorative Background Elements */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={[styles.glowCircle, glowStyle1, { top: -100, left: -50, backgroundColor: theme.primary }]}
        />
        <Animated.View
          style={[styles.glowCircle, glowStyle2, { top: 200, right: -80, backgroundColor: theme.accent, width: 250, height: 250 }]}
        />
        <Animated.View
          style={[styles.glowCircle, glowStyle1, { bottom: 100, left: -100, backgroundColor: theme.info }]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Greeting + Streak */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.greetingRow}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {getGreeting()}, {profile?.name || 'there'}
            </Text>
            <Text style={[styles.motivational, { color: theme.text }]}>
              {insights.motivationalMessage}
            </Text>
          </View>
          {insights.streak > 0 && (
            <StreakBadge streak={insights.streak} compact />
          )}
        </Animated.View>

        {/* Progress Ring + Current Weight */}
        {latestWeight && profile && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={[styles.heroCard, { backgroundColor: isDark ? theme.card + '90' : theme.card, borderColor: theme.cardBorder }]}
          >
            <View style={styles.heroRow}>
              <ProgressRing
                progress={insights.progress}
                size={100}
                strokeWidth={8}
                label="to goal"
              />

              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatLabel, { color: theme.textSecondary }]}>CURRENT</Text>
                  <View style={styles.weightRow}>
                    <Text style={[styles.heroWeight, { color: theme.text }]}>{latestWeight}</Text>
                    <Text style={[styles.heroUnit, { color: theme.textSecondary }]}>kg</Text>
                  </View>
                  {weightDiff !== null && weightDiff !== 0 && (
                    <View style={[
                      styles.diffBadge,
                      { backgroundColor: (weightDiff < 0 ? theme.success : theme.warning) + '15' },
                    ]}>
                      <Text style={[
                        styles.diffText,
                        { color: weightDiff < 0 ? theme.success : theme.warning },
                      ]}>
                        {weightDiff > 0 ? '+' : ''}{weightDiff} kg
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatLabel, { color: theme.textSecondary }]}>TARGET</Text>
                  <View style={styles.weightRow}>
                    <Text style={[styles.heroTarget, { color: theme.accent }]}>{profile.targetWeight}</Text>
                    <Text style={[styles.heroUnitSmall, { color: theme.textSecondary }]}>kg</Text>
                  </View>
                  <Text style={[styles.awayText, { color: theme.textSecondary }]}>
                    {insights.distanceToGoal} kg away
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Quick Stats */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={styles.statsGrid}
        >
          <StatCard
            label="BMI"
            value={insights.bmi > 0 ? insights.bmi.toString() : '--'}
            icon="📊"
            accentColor={getBMICategoryColor(insights.bmi, isDark)}
            compact
          />
          <View style={{ width: Spacing.md }} />
          <StatCard
            label="CATEGORY"
            value={insights.bmi > 0 ? insights.bmiCategory : '--'}
            icon="🏷️"
            accentColor={getBMICategoryColor(insights.bmi, isDark)}
            compact
          />
          <View style={{ width: Spacing.md }} />
          <StatCard
            label="LOGGED"
            value={entries.length.toString()}
            icon="📝"
            accentColor={theme.info}
            compact
          />
        </Animated.View>

        {/* Recent Entries */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.sectionHeader}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Entries</Text>
          <Text style={[styles.sectionAction, { color: theme.primary }]}>
            {entries.length} total
          </Text>
        </Animated.View>

        {entries.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(500).duration(600)}
            style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          >
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No entries yet</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Tap the + button to log your first weight
            </Text>
          </Animated.View>
        ) : (
          [...entries].reverse().slice(0, 7).map((entry, idx) => {
            const d = new Date(entry.date);
            const bmi = profile ? calculateBMI(entry.weight, profile.height) : 0;
            const isToday = new Date().toDateString() === d.toDateString();

            return (
              <Animated.View
                key={entry.id}
                entering={FadeInRight.delay(500 + idx * 100).duration(500)}
                layout={Layout.springify()}
                style={[
                  styles.entryItem,
                  {
                    backgroundColor: isDark ? theme.card + '80' : theme.card,
                    borderColor: isToday ? theme.primary + '40' : theme.cardBorder,
                    borderWidth: isToday ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.entryLeft}>
                  <View style={[styles.entryDot, { backgroundColor: theme.primary }]} />
                  <View>
                    <Text style={[styles.entryWeight, { color: theme.text }]}>
                      {entry.weight} kg
                    </Text>
                    <Text style={[styles.entryDate, { color: theme.textSecondary }]}>
                      {isToday ? 'Today' : d.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                      })}
                      {' · '}
                      {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>

                {bmi > 0 && (
                  <View style={[styles.bmiBadge, { backgroundColor: getBMICategoryColor(bmi, isDark) + '15' }]}>
                    <Text style={[styles.bmiText, { color: getBMICategoryColor(bmi, isDark) }]}>
                      {bmi}
                    </Text>
                  </View>
                )}
              </Animated.View>
            );
          })
        )}

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setModalVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Quick Log Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />

            <ScrollView 
              bounces={false} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Log Weight</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={[styles.modalClose, { color: theme.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>WEIGHT (KG)</Text>
              <TextInput
                style={[styles.weightInputLarge, { color: theme.text, borderColor: theme.primary + '40', backgroundColor: theme.card }]}
                placeholder="0.0"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
                value={weightInput}
                onChangeText={setWeightInput}
                autoFocus
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>NOTE (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                placeholder="e.g. After workout"
                placeholderTextColor={theme.icon}
                value={noteInput}
                onChangeText={setNoteInput}
                multiline={false}
              />

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: Spacing.lg }]}
                onPress={handleQuickLog}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Save Entry</Text>
              </TouchableOpacity>
              
              {/* Extra space for keyboard comfort */}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Celebratory Components */}
      {showConfetti && (
        <Confetti onAnimationEnd={() => setShowConfetti(false)} />
      )}

      <StatusModal
        visible={showGoalModal}
        type="success"
        title="GOAL REACHED! 🎉"
        message="Congratulations! You've successfully hit your target weight. Your dedication has paid off. Ready to celebrate?"
        confirmLabel="Rate the App ⭐"
        onConfirm={handleRateApp}
        onClose={() => setShowGoalModal(false)}
        icon="🏆"
      />
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },

  // Greeting
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.caption,
    marginBottom: 4,
  },
  motivational: {
    ...Typography.bodyMedium,
    lineHeight: 20,
  },

  // Hero card
  heroCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStats: {
    flex: 1,
    marginLeft: Spacing.xl,
  },
  heroStatItem: {
    marginBottom: Spacing.md,
  },
  heroStatLabel: {
    ...Typography.label,
    marginBottom: 2,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroWeight: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  heroUnit: {
    ...Typography.body,
    marginLeft: 4,
  },
  heroTarget: {
    ...Typography.statSmall,
  },
  heroUnitSmall: {
    ...Typography.caption,
    marginLeft: 4,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  diffText: {
    ...Typography.captionMedium,
  },
  awayText: {
    ...Typography.caption,
    marginTop: 2,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.heading3,
  },
  sectionAction: {
    ...Typography.captionMedium,
  },

  // Entry items
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  entryWeight: {
    ...Typography.bodyMedium,
  },
  entryDate: {
    ...Typography.caption,
    marginTop: 2,
  },
  bmiBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  bmiText: {
    ...Typography.captionMedium,
  },

  // Empty state
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
  emptyTitle: {
    ...Typography.bodyMedium,
    marginBottom: 4,
  },
  emptyDesc: {
    ...Typography.caption,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xxl,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.heading2,
  },
  modalClose: {
    fontSize: 20,
    padding: Spacing.sm,
  },

  // Inputs
  inputLabel: {
    ...Typography.label,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    ...Typography.body,
  },
  weightInputLarge: {
    borderWidth: 2,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -1,
  },

  // Buttons
  primaryButton: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  primaryButtonText: {
    color: '#fff',
    ...Typography.bodyMedium,
    fontWeight: '600',
  },

  // Onboarding
  onboardContainer: {
    padding: Spacing.xxl,
    paddingTop: 60,
  },
  onboardEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  onboardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  onboardLogo: {
    width: 36,
    height: 36,
    marginRight: 12,
    borderRadius: 8,
  },
  onboardTitle: {
    ...Typography.heading1,
  },
  onboardSubtitle: {
    ...Typography.body,
    marginBottom: Spacing.xxxl,
  },
  onboardForm: {
    gap: 4,
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.4,
  },
});
