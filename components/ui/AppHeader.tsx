import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export default function AppHeader({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top, backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <View style={styles.container}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconContainer}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconContainer} />
        )}

        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 1000,
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    flex: 1,
    textAlign: 'left',  
  },
  rightComponent: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
