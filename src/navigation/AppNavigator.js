import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  ScrollView, Modal, TextInput, Alert, Animated, Dimensions, Image,
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
import TimetableScreen       from '../screens/TimetableScreen';
import AdminScreen           from '../screens/AdminScreen';

const Stack  = createStackNavigator();
const S      = SPACING;
const SCREEN = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN.width * 0.78, 300);

const ADMIN_PASSWORD = 'Bond442@love1';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const MAIN_TABS = [
  { name: 'Home',      label: 'Home',      icon: 'home-outline',          iconOn: 'home',           component: HomeScreen          },
  { name: 'Materials', label: 'Materials', icon: 'book-outline',          iconOn: 'book',           component: MaterialsScreen     },
  { name: 'PastQ',     label: 'Past Q',    icon: 'document-text-outline', iconOn: 'document-text',  component: PastQScreen         },
  { name: 'Timetable', label: 'Timetable', icon: 'grid-outline',          iconOn: 'grid',           component: TimetableScreen     },
];

const SIDEBAR_ITEMS = [
  { name: 'Search',  label: 'Search',   icon: 'search-outline',        iconOn: 'search',        component: SearchScreen          },
  { name: 'Notice',  label: 'Notice',   icon: 'notifications-outline', iconOn: 'notifications', component: AnnouncementsScreen   },
  { name: 'Leaders', label: 'Leaders',  icon: 'people-outline',        iconOn: 'people',        component: LeadersScreen         },
  { name: 'Events',  label: 'Events',   icon: 'calendar-outline',      iconOn: 'calendar',      component: EventsScreen          },
  { name: 'Exams',   label: 'Exams',    icon: 'alarm-outline',         iconOn: 'alarm',         component: ExamCountdownScreen   },
  { name: 'Forum',   label: 'Forum',    icon: 'chatbubbles-outline',   iconOn: 'chatbubbles',   component: ForumScreen           },
  { name: 'CWA',     label: 'CWA',      icon: 'calculator-outline',    iconOn: 'calculator',    component: CWAScreen             },
  { name: 'Planner', label: 'Planner',  icon: 'trending-up-outline',   iconOn: 'trending-up',   component: SemesterPlannerScreen },
];

const ADMIN_ITEM = {
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ visible, activeTab, onClose, onNavigate, sidebarItems }) {
  const insets   = useSafeAreaInsets();
  const slideX   = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacity  = useRef(new Animated.Value(0)).current;
  const isOpen   = useRef(false);

  // Animate when visible changes
  React.useEffect(() => {
    if (visible && !isOpen.current) {
      isOpen.current = true;
      Animated.parallel([
        Animated.timing(slideX,  { toValue: 0,   duration: 260, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,   duration: 260, useNativeDriver: true }),
      ]).start();
    } else if (!visible && isOpen.current) {
      Animated.parallel([
        Animated.timing(slideX,  { toValue: -SIDEBAR_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,              duration: 220, useNativeDriver: true }),
      ]).start(() => { isOpen.current = false; });
    }
  }, [visible]);

  if (!visible && !isOpen.current) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[sd.backdrop, { opacity }]} pointerEvents="auto">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          sd.drawer,
          { width: SIDEBAR_WIDTH, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
          { transform: [{ translateX: slideX }] },
        ]}
        pointerEvents="auto"
      >
        {/* Logo + title */}
        <View style={sd.header}>
          <View style={sd.logoWrap}>
            <Image
              source={require('../assets/gesa-logo.png')}
              style={sd.logo}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={sd.appName}>GESA UMaT</Text>
            <Text style={sd.appSub}>Student Portal</Text>
          </View>
        </View>

        <View style={sd.divider} />

        <Text style={sd.sectionLabel}>MORE SCREENS</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {sidebarItems.map(item => {
            const isActive = activeTab === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[sd.item, isActive && sd.itemActive]}
                onPress={() => { onNavigate(item.name); onClose(); }}
                activeOpacity={0.75}
              >
                <View style={[sd.itemIco, isActive && sd.itemIcoActive]}>
                  <Ionicons
                    name={isActive ? item.iconOn : item.icon}
                    size={18}
                    color={isActive ? COLORS.gold2 : COLORS.muted}
                  />
                </View>
                <Text style={[sd.itemLabel, isActive && sd.itemLabelActive]}>
                  {item.label}
                </Text>
                {isActive && <View style={sd.activeBar} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={sd.divider} />
        <Text style={sd.footer}>GESA UMaT © {new Date().getFullYear()}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Custom tab bar ───────────────────────────────────────────────────────────
function BottomTabBar({ tabs, activeTab, onTabPress, onMorePress, onHomeTap }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[tb.wrapper, { paddingBottom: insets.bottom || 8 }]}>
      <View style={tb.topLine} />
      <View style={tb.row}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.name;
          const isHome   = tab.name === 'Home';
          return (
            <TouchableOpacity
              key={tab.name}
              style={[tb.tab, isActive && tb.tabActive]}
              onPress={() => {
                if (isHome) onHomeTap?.();
                onTabPress(tab.name);
              }}
              activeOpacity={0.75}
            >
              {isActive && <View style={tb.activeDot} />}
              <Ionicons
                name={isActive ? tab.iconOn : tab.icon}
                size={22}
                color={isActive ? COLORS.gold2 : COLORS.dim}
              />
              <Text style={[tb.label, isActive && tb.labelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* More button */}
        <TouchableOpacity style={tb.tab} onPress={onMorePress} activeOpacity={0.75}>
          <Ionicons name="menu-outline" size={22} color={COLORS.dim} />
          <Text style={tb.label}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main app layout ──────────────────────────────────────────────────────────
function AppLayout({ adminUnlocked, onAdminTap }) {
  const [activeTab,    setActiveTab]    = useState('Home');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const sidebarItems = adminUnlocked ? [...SIDEBAR_ITEMS, ADMIN_ITEM] : SIDEBAR_ITEMS;

  // All navigable screens = main tabs + sidebar items
  const allScreens = [...MAIN_TABS, ...sidebarItems];
  const CurrentScreen = allScreens.find(t => t.name === activeTab)?.component || HomeScreen;

  const navigate = useCallback((name) => {
    const found = allScreens.find(t => t.name === name);
    if (found) setActiveTab(name);
  }, [allScreens]);

  const fakeNavigation = {
    navigate,
    goBack: () => {},
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ flex: 1 }}>
        <CurrentScreen navigation={fakeNavigation} />
      </View>

      <BottomTabBar
        tabs={MAIN_TABS}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onMorePress={() => setSidebarOpen(true)}
        onHomeTap={onAdminTap}
      />

      <Sidebar
        visible={sidebarOpen}
        activeTab={activeTab}
        sidebarItems={sidebarItems}
        onClose={() => setSidebarOpen(false)}
        onNavigate={navigate}
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
          Alert.alert('🔓 Admin unlocked', 'Admin is now available in the sidebar under "More".');
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const tb = StyleSheet.create({
  wrapper:     { backgroundColor: 'rgba(13,10,28,0.98)', borderTopWidth: 0 },
  topLine:     { height: 1, backgroundColor: COLORS.border },
  row:         { flexDirection: 'row', paddingHorizontal: S.sm, paddingTop: S.sm, paddingBottom: 4 },
  tab:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: RADIUS.lg, position: 'relative', minWidth: 56 },
  tabActive:   { backgroundColor: 'rgba(212,160,23,0.08)' },
  activeDot:   { position: 'absolute', top: 0, width: 18, height: 3, borderRadius: 2, backgroundColor: COLORS.gold2 },
  label:       { fontSize: 9, color: COLORS.dim, marginTop: 3, fontWeight: '500' },
  labelActive: { color: COLORS.gold2, fontWeight: '700' },
});

const sd = StyleSheet.create({
  backdrop:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  drawer:         { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: '#110d2a', borderRightWidth: 1, borderRightColor: COLORS.border, paddingHorizontal: 0 },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 16 },
  logoWrap:       { width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(212,160,23,0.1)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logo:           { width: 36, height: 36 },
  appName:        { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  appSub:         { color: COLORS.muted, fontSize: 10, marginTop: 1 },
  divider:        { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20, marginVertical: 12 },
  sectionLabel:   { color: COLORS.dim, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, paddingHorizontal: 20, marginBottom: 6 },
  item:           { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 20, marginHorizontal: 10, borderRadius: RADIUS.md, marginBottom: 2, position: 'relative' },
  itemActive:     { backgroundColor: 'rgba(212,160,23,0.08)' },
  itemIco:        { width: 34, height: 34, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
  itemIcoActive:  { backgroundColor: 'rgba(212,160,23,0.13)' },
  itemLabel:      { color: COLORS.muted, fontSize: 13, fontWeight: '500', flex: 1 },
  itemLabelActive:{ color: COLORS.gold2, fontWeight: '700' },
  activeBar:      { position: 'absolute', right: 10, width: 3, height: 20, borderRadius: 2, backgroundColor: COLORS.gold2 },
  footer:         { color: COLORS.dim, fontSize: 9, textAlign: 'center', paddingHorizontal: 20, paddingTop: 4 },
});

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
