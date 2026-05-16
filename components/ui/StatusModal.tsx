// components/ui/StatusModal.tsx — Premium styled modal for alerts, success, and confirmations

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, BlurView } from 'react-native';
import Animated, { ZoomIn, FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Typography, Radius, Spacing, Shadows } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface StatusModalProps {
  visible: boolean;
  type: 'success' | 'danger' | 'info';
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose?: () => void;
  icon?: string;
}

export default function StatusModal({
  visible,
  type,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
  icon
}: StatusModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const accentColor = type === 'success' ? theme.success : type === 'danger' ? theme.danger : theme.primary;
  const defaultIcon = type === 'success' ? '🏆' : type === 'danger' ? '🗑️' : 'ℹ️';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View 
          entering={ZoomIn.duration(400)}
          style={[
            styles.sheet, 
            { 
              backgroundColor: isDark ? '#1E1E35' : '#FFFFFF',
              borderColor: isDark ? theme.cardBorder : '#EEEEEE',
              borderWidth: 1
            }
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
            <Text style={styles.icon}>{icon || defaultIcon}</Text>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

          <View style={styles.footer}>
            {onClose && (
              <TouchableOpacity 
                onPress={onClose}
                style={[styles.button, styles.secondaryButton, { borderColor: theme.border }]}
              >
                <Text style={[styles.buttonText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={onConfirm}
              style={[styles.button, { backgroundColor: accentColor }]}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    ...Typography.heading2,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    color: '#94A3B8',
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  }
});
