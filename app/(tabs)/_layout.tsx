import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors, typography } from '@/constants/tokens';

// ボトムタブ仕様：選択中=accentDeep・非選択=textMuted、アイコン20＋ラベル10（DESIGN.md §5）
const TAB_ICON_SIZE = 20;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accentDeep,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: typography.caption.fontWeight,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'カレンダー',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={TAB_ICON_SIZE} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: '一覧',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={TAB_ICON_SIZE} name="list.bullet" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={TAB_ICON_SIZE} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
