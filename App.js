import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { enableNetwork } from 'firebase/firestore';
import { db } from './firebase';
import AppNavigator from './src/navigation/AppNavigator';
import { saveExpoPushToken } from './src/hooks/useFirestore';

// ─── Show notifications when app is foregrounded ──────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

// ─── Register device for push notifications ───────────────────────────────────
async function registerPushToken() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await saveExpoPushToken(tokenData.data);
  } catch (e) {
    console.log('Push token error:', e.message);
  }
}

export default function App() {
  useEffect(() => {
    registerPushToken();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#07050f" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
