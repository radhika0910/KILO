// app/(tabs)/profile.tsx — Profile & Settings Tab

import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import StatusModal from '@/components/ui/StatusModal';
import { Colors } from '@/constants/Colors';
import { Radius, Shadows, Spacing, Typography } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useInsights } from '@/hooks/useInsights';
import { useWeightData } from '@/hooks/useWeightData';
import { calculateBMI, getBMICategoryColor } from '@/utils/calculations';
import { clearAllData, exportAllData } from '@/utils/storage';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const { entries, profile, updateProfile, refresh } = useWeightData();
  const insights = useInsights(entries, profile);

  const [editField, setEditField] = useState<null | 'name' | 'targetWeight' | 'height' | 'age'>(null);
  const [inputValue, setInputValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const handleSaveField = async () => {
    if (!profile || !editField) return;

    let updatedProfile = { ...profile };

    if (editField === 'name') {
      updatedProfile.name = inputValue.trim() || profile.name;
    } else {
      const num = parseFloat(inputValue);
      if (!num || num <= 0) {
        Alert.alert('Invalid Value', 'Please enter a valid number.');
        return;
      }
      updatedProfile[editField] = num;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateProfile(updatedProfile);
    setEditField(null);
    setInputValue('');
  };

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      await Share.share({
        message: data,
        title: 'KILO - Weight Data Export',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export data.');
    }
  };

  const handleDeleteAll = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const success = await clearAllData();
    if (success) {
      setShowDeleteConfirm(false);
      await refresh();
      setTimeout(() => {
        setShowDeleteSuccess(true);
      }, 500);
    }
  };

  const handleMoreFromDev = () => {
    Linking.openURL('https://github.com/radhika0910');
  };

  const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;
  const bmi = currentWeight && profile ? calculateBMI(currentWeight, profile.height) : 0;
  const bmiColor = bmi > 0 ? getBMICategoryColor(bmi, isDark) : theme.textSecondary;

  const settingsItems = [
    {
      icon: '👤',
      label: 'Name',
      value: profile?.name || 'Not set',
      onPress: () => {
        setEditField('name');
        setInputValue(profile?.name || '');
      },
    },
    {
      icon: '🎯',
      label: 'Target Weight',
      value: profile ? `${profile.targetWeight} kg` : '--',
      onPress: () => {
        setEditField('targetWeight');
        setInputValue(profile?.targetWeight?.toString() || '');
      },
    },
    {
      icon: '📏',
      label: 'Height',
      value: profile ? `${profile.height} cm` : '--',
      onPress: () => {
        setEditField('height');
        setInputValue(profile?.height?.toString() || '');
      },
    },
    {
      icon: '🎂',
      label: 'Age',
      value: profile ? `${profile.age} years` : '--',
      onPress: () => {
        setEditField('age');
        setInputValue(profile?.age?.toString() || '');
      },
    },
  ];

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
            <Text style={styles.avatarText}>
              {(profile?.name?.[0] || '?').toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.profileName, { color: theme.text }]}>
            {profile?.name || 'User'}
          </Text>

          <View style={styles.profileStats}>
            <View style={styles.profileStatItem}>
              <Text style={[styles.profileStatValue, { color: theme.primary }]}>
                {currentWeight || '--'}
              </Text>
              <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>
                Current (kg)
              </Text>
            </View>

            <View style={[styles.profileStatDivider, { backgroundColor: theme.border }]} />

            <View style={styles.profileStatItem}>
              <Text style={[styles.profileStatValue, { color: bmiColor }]}>
                {bmi > 0 ? bmi : '--'}
              </Text>
              <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>
                BMI
              </Text>
            </View>

            <View style={[styles.profileStatDivider, { backgroundColor: theme.border }]} />

            <View style={styles.profileStatItem}>
              <Text style={[styles.profileStatValue, { color: theme.accent }]}>
                {entries.length}
              </Text>
              <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>
                Entries
              </Text>
            </View>
          </View>

          {profile?.createdAt && (
            <Text style={[styles.memberSince, { color: theme.textSecondary }]}>
              Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          )}
        </View>

        {/* Personal Info */}
        <Text style={[styles.groupTitle, { color: theme.text }]}>Personal Info</Text>

        {settingsItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.settingItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>{item.icon}</Text>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{item.label}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                {item.value}
              </Text>
              <Text style={[styles.chevron, { color: theme.icon }]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Actions */}
        <Text style={[styles.groupTitle, { color: theme.text }]}>Actions</Text>

        {/* <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={handleExportData}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📤</Text>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Export Data</Text>
          </View>
          <Text style={[styles.chevron, { color: theme.icon }]}>›</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={handleMoreFromDev}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>👩‍💻</Text>
            <Text style={[styles.settingLabel, { color: theme.text }]}>More from Developer</Text>
          </View>
          <Text style={[styles.chevron, { color: theme.icon }]}>›</Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text style={[styles.groupTitle, { color: theme.danger }]}>Danger Zone</Text>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.danger + '08', borderColor: theme.danger + '30' }]}
          onPress={() => setShowDeleteConfirm(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🗑️</Text>
            <Text style={[styles.settingLabel, { color: theme.danger }]}>Delete All Data</Text>
          </View>
          <Text style={[styles.chevron, { color: theme.danger }]}>›</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: theme.primary }]}>KILO</Text>
          <Text style={[styles.appVersion, { color: theme.textSecondary }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
            Track. Transform. Triumph. 💜
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Field Modal */}
      <Modal visible={!!editField} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Change {editField === 'name' ? 'Name' :
                editField === 'targetWeight' ? 'Target Weight' :
                  editField === 'height' ? 'Height' : 'Age'}
            </Text>

            <TextInput
              style={[styles.modalInput, { color: theme.text, backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              placeholder="Enter value"
              placeholderTextColor={theme.icon}
              keyboardType={editField === 'name' ? 'default' : 'numeric'}
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.border }]}
                onPress={() => setEditField(null)}
              >
                <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveField}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Premium Status Modals */}
      <StatusModal
        visible={showDeleteConfirm}
        type="danger"
        title="Delete All Data?"
        message="This action is permanent and cannot be undone. All your weights, goals, and profile settings will be wiped."
        confirmLabel="Delete Everything"
        onConfirm={handleDeleteAll}
        onClose={() => setShowDeleteConfirm(false)}
        icon="⚠️"
      />

      <StatusModal
        visible={showDeleteSuccess}
        type="success"
        title="Data Wiped"
        message="Everything has been cleared successfully. You can now start a fresh journey whenever you're ready."
        confirmLabel="Got it"
        onConfirm={() => setShowDeleteSuccess(false)}
        icon="✅"
      />
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

  // Profile card
  profileCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7C3AED',
  },
  profileName: {
    ...Typography.heading2,
    marginBottom: Spacing.lg,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  profileStatItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  profileStatValue: {
    ...Typography.statSmall,
    marginBottom: 2,
  },
  profileStatLabel: {
    ...Typography.caption,
  },
  profileStatDivider: {
    width: 1,
    height: 30,
  },
  memberSince: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },

  // Groups
  groupTitle: {
    ...Typography.heading3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },

  // Setting item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.body,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    ...Typography.caption,
    marginRight: Spacing.sm,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },

  // App info
  appInfo: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
    paddingTop: Spacing.xl,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
  },
  appVersion: {
    ...Typography.caption,
    marginTop: 4,
  },
  appTagline: {
    ...Typography.caption,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalBox: {
    width: '100%',
    maxWidth: 350,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
  },
  modalTitle: {
    ...Typography.heading3,
    marginBottom: Spacing.lg,
  },
  modalMessage: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    ...Typography.body,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  modalBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
  },
  modalBtnText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  deleteEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
