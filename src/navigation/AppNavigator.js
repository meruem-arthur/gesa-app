import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Alert, Platform, Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

import HomeScreen            from '../screens/HomeScreen';
import AnnouncementsScreen   from '../screens/AnnouncementsScreen';
import LeadersScreen         from '../screens/LeadersScreen';
import MaterialsScreen       from '../screens/MaterialsScreen';
import PastQScreen           from '../screens/PastQScreen';
import EventsScreen          from '../screens/EventsScreen';
import CWAScreen             from '../screens/CWAScreen';
import SearchScreen          from '../screens/SearchScreen';
import ExamCountdownScreen   from '../screens/ExamCountdownScreen';
import ForumScreen           from '../screens/ForumScreen';
import SemesterPlannerScreen from '../screens/SemesterPlannerScreen';
import AdminScreen           from '../screens/AdminScreen';

const Stack = createStackNavigator();
const S = SPACING;

const ADMIN_PASSWORD = 'Bond442@love1';

// ─── All tabs definition ──────────────────────────────────────────────────────
const BASE_TABS = [
  { name: 'Home',          label: 'Home',      icon: 'home-outline',             iconOn: 'home',              component: HomeScreen            },
  { name: 'Search',        label: 'Search',    icon: 'search-outline',           iconOn: 'search',            component: SearchScreen          },
  { name: 'Notice',        label: 'Notice',    icon: 'notifications-outline',    iconOn: 'notifications',     component: AnnouncementsScreen   },
  { name: 'Leaders',       label: 'Leaders',   icon: 'people-outline',           iconOn: 'people',            component: LeadersScreen         },
  { name: 'Materials',     label: 'Materials', icon: 'book-outline',             iconOn: 'book',              component: MaterialsScreen       },
  { name: 'PastQ',         label: 'Past Q',    icon: 'document-text-outline',    iconOn: 'document-text',     component: PastQScreen           },
  { name: 'Events',        label: 'Events',    icon: 'calendar-outline',         iconOn: 'calendar',          component: EventsScreen          },
  { name: 'Exams',         label: 'Exams',     icon: 'alarm-outline',            iconOn: 'alarm',             component: ExamCountdownScreen   },
  { name: 'Forum',         label: 'Forum',     icon: 'chatbubbles-outline',      iconOn: 'chatbubbles',       component: ForumScreen           },
  { name: 'CWA',           label: 'CWA',       icon: 'calculator-outline',       iconOn: 'calculator',        component: CWAScreen             },
  { name: 'Planner',       label: 'Planner',   icon: 'trending-up-outline',      iconOn: 'trending-up',       component: SemesterPlannerScreen },
];

const ADMIN_TAB = {
  name: 'Admin', label: 'Admin',
  icon: 'shield-checkmark-outline', iconOn: 'shield-checkmark',
  component: AdminScreen,
};

// ─── Secret admin unlock hook ─────────────────────────────────────────────────
function useAdminUnlock(onUnlocked) {
  const taps  = useRef(0);
  const timer = useRef(null);
  return function handleTap() {
    taps.current += 1;
    if (timer.current) clearTimeout(timer.current);
    if (taps.current >= 5) { taps.current = 0; onUnlocked(); }
    else timer.current = setTimeout(() => { taps.current = 0; }, 2000);
  };
}

// ─── Admin password modal ─────────────────────────────────────────────────────
function AdminPasswordModal({ visible, onCancel, onSuccess }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');

  function handleSubmit() {
    if (pwd === ADMIN_PASSWORD) { setPwd(''); setErr(''); onSuccess(); }
    else setErr('Incorrect password.');
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={ms.overlay}>
        <View style={ms.box}>
          <Ionicons name="shield-checkmark" size={28} color={COLORS.gold2} style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={ms.title}>Admin Access</Text>
          <Text style={ms.sub}>Enter the admin password to unlock the control panel.</Text>
          <TextInput
            style={ms.input} placeholder="Password" placeholderTextColor={COLORS.dim}
            secureTextEntry value={pwd} onChangeText={t => { setPwd(t); setErr(''); }}
          />
          {!!err && <Text style={ms.err}>{err}</Text>}
          <View style={ms.btns}>
            <TouchableOpacity style={ms.cancelBtn} onPress={() => { setPwd(''); setErr(''); onCancel(); }}>
              <Text style={ms.cancelTx}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ms.confirmBtn} onPress={handleSubmit}>
              <Text style={ms.confirmTx}>Unlock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Custom scrollable tab bar ────────────────────────────────────────────────
function ScrollableTabBar({ tabs, activeTab, onTabPress, onHomeLongPress }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);

  return (
    <View style={[tb.wrapper, { paddingBottom: insets.bottom || 8 }]}>
      <View style={tb.topLine} />
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tb.scrollContent}
        bounces={false}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.name;
          const isHome   = tab.name === 'Home';

          return (
            <TouchableOpacity
              key={tab.name}
              style={[tb.tab, isActive && tb.tabActive]}
              onPress={() => {
                if (isHome) onHomeLongPress?.();
                onTabPress(tab.name);
              }}
              onLongPress={isHome ? onHomeLongPress : undefined}
              activeOpacity={0.75}
            >
              {/* Active indicator dot */}
              {isActive && <View style={tb.activeDot} />}

              <Ionicons
                name={isActive ? tab.iconOn : tab.icon}
                size={22}
                color={isActive ? COLORS.gold2 : COLORS.dim}
              />
              <Text style={[tb.label, isActive && tb.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Main app layout ──────────────────────────────────────────────────────────
function AppLayout({ adminUnlocked, onAdminTap }) {
  const [activeTab, setActiveTab] = useState('Home');

  const tabs = adminUnlocked ? [...BASE_TABS, ADMIN_TAB] : BASE_TABS;
  const CurrentScreen = tabs.find(t => t.name === activeTab)?.component || HomeScreen;

  // Build a fake navigation object for screens that use navigation.navigate
  const fakeNavigation = {
    navigate: (name) => {
      const found = tabs.find(t => t.name === name);
      if (found) setActiveTab(name);
    },
    goBack: () => {},
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Screen content */}
      <View style={{ flex: 1 }}>
        <CurrentScreen navigation={fakeNavigation} />
      </View>

      {/* Scrollable tab bar */}
      <ScrollableTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onHomeLongPress={onAdminTap}
      />
    </View>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pwdVisible,    setPwdVisible]    = useState(false);

  const handleSecretTap = useAdminUnlock(() => setPwdVisible(true));

  return (
    <NavigationContainer>
      <AdminPasswordModal
        visible={pwdVisible}
        onCancel={() => setPwdVisible(false)}
        onSuccess={() => {
          setPwdVisible(false);
          setAdminUnlocked(true);
          Alert.alert('🔓 Admin unlocked', 'Admin tab is now visible. Scroll to the end of the tab bar.');
        }}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root">
          {() => (
            <AppLayout
              adminUnlocked={adminUnlocked}
              onAdminTap={handleSecretTap}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── Tab bar styles ───────────────────────────────────────────────────────────
const tb = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(13,10,28,0.98)',
    borderTopWidth: 0,
  },
  topLine: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  scrollContent: {
    paddingHorizontal: S.sm,
    paddingVertical: S.sm,
    gap: 4,
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.lg,
    minWidth: 60,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: 'rgba(212,160,23,0.08)',
  },
  activeDot: {
    position: 'absolute',
    top: 0,
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.gold2,
  },
  label: {
    fontSize: 9,
    color: COLORS.dim,
    marginTop: 3,
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.gold2,
    fontWeight: '700',
  },
});

// ─── Modal styles ─────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  box:        { backgroundColor: COLORS.card, borderRadius: 16, padding: 24, width: '100%', borderWidth: 1, borderColor: COLORS.border },
  title:      { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  sub:        { color: COLORS.muted, fontSize: 12, marginBottom: 16, textAlign: 'center' },
  input:      { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, color: COLORS.text, fontSize: 14, marginBottom: 6 },
  err:        { color: '#f87171', fontSize: 12, marginBottom: 6 },
  btns:       { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn:  { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelTx:   { color: COLORS.muted, fontSize: 13 },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: COLORS.gold2, alignItems: 'center' },
  confirmTx:  { color: '#000', fontSize: 13, fontWeight: '700' },
});
