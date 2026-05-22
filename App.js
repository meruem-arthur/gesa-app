import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform, Alert } from 'react-native'
import AppNavigator from './src/navigation/AppNavigator'
import { saveExpoPushToken } from './src/hooks/useFirestore'

// ─── Show notifications when app is foregrounded ──────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
})

// ─── Register device for push notifications ───────────────────────────────────
async function registerPushToken() {
  try {
    // Must be a physical device
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices')
      return
    }

    // Android needs a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#e8b82a',
      })
    }

    // Request permission
    const { status: existing } = await Notifications.getPermissionsAsync()
    let finalStatus = existing
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied')
      return
    }

    // Get the token — projectId is required in SDK 49+
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'aa0726ce-a058-4583-ab26-dd4fb2fa7b89', // ← replace with your actual project ID
    })

    console.log('Push token:', tokenData.data)
    await saveExpoPushToken(tokenData.data)
    console.log('Push token saved to Firestore ✅')

  } catch (e) {
    console.log('Push token error:', e.message)
  }
}

export default function App() {
  useEffect(() => {
    registerPushToken()
  }, [])

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#07050f" />
      <AppNavigator />
    </SafeAreaProvider>
  )
}
