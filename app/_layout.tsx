import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { migrateDbIfNeeded } from '@/lib/db/migrations';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="nodakke.db" onInit={migrateDbIfNeeded}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="item/new" options={{ presentation: 'modal', title: '新規登録' }} />
          <Stack.Screen name="item/[id]" options={{ presentation: 'modal', title: '編集' }} />
        </Stack>
        <StatusBar style="dark" />
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
