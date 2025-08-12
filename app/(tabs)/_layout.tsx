import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AntDesign } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.highlight,
        tabBarInactiveTintColor: theme.icon,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
           [styles.tabBarMobile, { backgroundColor: theme.card, borderTopColor: theme.border }],
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={29} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
                        < AntDesign size={26} name="setting" color={color} />

          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
 
  tabBarMobile: {
    height: 60,
    borderTopWidth: 0,
    paddingBottom: 6,
    paddingTop: 6,
    position: 'absolute',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 30, 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
