// components/ui/AppHeader.tsx — Premium gradient header for KILO

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export default function AppHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightComponent,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: insets.top + 8,
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.container}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconContainer}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconContainer} />
        )}

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightComponent}>{rightComponent}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 1000,
  },
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...Typography.heading2,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  rightComponent: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
