// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { requestPermission } from '../src/notifications/scheduler';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#F5F5F0' }, headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: 'Subscription Guard', headerShown: false }} />
      <Stack.Screen name="add" options={{ title: 'サブスクを追加', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: '詳細・解約メモ', presentation: 'modal' }} />
    </Stack>
  );
}
