import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform, Alert } from 'react-native'
import AppNavigator from './src/navigation/AppNavigator'
import { ThemeProvider, useTheme } from './src/constants/ThemeContext'
import { saveExpoPushToken } from './src/hooks/useFirestore'
import { requestScreen } from './src/navigation/notificationNav'

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

// Light icons on the dark theme, dark icons on the light theme.
function ThemedStatusBar() {
  const { isDark } = useTheme()
  return <StatusBar style={isDark ? 'light' : 'dark'} />
}

// ─── Open the right screen when a notification is tapped ──────────────────────
const handledTaps = new Set()
function handleNotificationTap(response) {
  if (!response) return
  const id = response.notification?.request?.identifier
  if (id) {
    if (handledTaps.has(id)) return
    handledTaps.add(id)
  }
  const screen = response.notification?.request?.content?.data?.screen
  if (screen) requestScreen(screen)
}

export default function App() {
  useEffect(() => {
    registerPushToken()

    // Tap while the app is open or in the background
    const sub = Notifications.addNotificationResponseReceivedListener(handleNotificationTap)

    // Tap that launched the app from a fully closed state
    Notifications.getLastNotificationResponseAsync()
      .then(handleNotificationTap)
      .catch(() => {})

    return () => sub.remove()
  }, [])

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ThemedStatusBar />
        <AppNavigator />
      </SafeAreaProvider>
    </ThemeProvider>
  )
}
