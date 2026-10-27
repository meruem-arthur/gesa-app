import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  ScrollView, Modal, Animated, Dimensions, Image,
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, themed } from '../constants/theme';
import { useTheme } from '../constants/ThemeContext';
import { subscribeToScreenRequests } from './notificationNav';

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
import ReportScreen          from '../screens/ReportScreen';
import SoftwareScreen        from '../screens/SoftwareScreen';
import TutorialsScreen       from '../screens/TutorialsScreen';
import TalkToSomeoneScreen   from '../screens/TalkToSomeoneScreen';
import BusinessHubScreen     from '../screens/BusinessHubScreen';

const Stack  = createStackNavigator();
const S      = SPACING;
const SCREEN = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN.width * 0.78, 300);

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
  { name: 'CWA',      label: 'CWA',      icon: 'calculator-outline',    iconOn: 'calculator',    component: CWAScreen             },
  { name: 'Planner',  label: 'Planner',  icon: 'trending-up-outline',   iconOn: 'trending-up',   component: SemesterPlannerScreen },
  { name: 'Software', label: 'Software', icon: 'desktop-outline',       iconOn: 'desktop',       component: SoftwareScreen        },
  { name: 'Tutorials',label: 'Tutorials',icon: 'play-circle-outline',   iconOn: 'play-circle',   component: TutorialsScreen       },
  { name: 'Business', label: 'Business Hub', icon: 'storefront-outline',   iconOn: 'storefront',    component: BusinessHubScreen     },
  { name: 'Welfare',  label: 'Talk to Someone', icon: 'heart-outline',     iconOn: 'heart',         component: TalkToSomeoneScreen   },
  { name: 'Report',   label: 'Report',   icon: 'flag-outline',          iconOn: 'flag',          component: ReportScreen          },
];

// ─── Light / Dark switch ──────────────────────────────────────────────────────
function ThemeSwitch() {
  const { name, setTheme } = useTheme();
  const OPTIONS = [
    { key: 'light', icon: 'sunny-outline', label: 'Light' },
    { key: 'dark',  icon: 'moon-outline',  label: 'Dark'  },
  ];
  return (
    <View style={sw.wrap}>
      {OPTIONS.map(o => {
        const on = name === o.key;
        return (
          <TouchableOpacity
            key={o.key}
            style={[sw.opt, on && sw.optOn]}
            onPress={() => setTheme(o.key)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            <Ionicons name={on ? o.icon.replace('-outline', '') : o.icon} size={15} color={on ? COLORS.gold2 : COLORS.muted} />
            <Text style={[sw.tx, on && sw.txOn]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ visible, activeTab, onClose, onNavigate, sidebarItems }) {
  const insets  = useSafeAreaInsets();
  const slideX  = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  // Track whether modal should stay mounted during close animation
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      // Small delay so Modal is fully mounted before animating
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideX,  { toValue: 0, duration: 260, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        ]).start();
      }, 10);
    } else {
      Animated.parallel([
        Animated.timing(slideX,  { toValue: -SIDEBAR_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,              duration: 220, useNativeDriver: true }),
      ]).start(() => {
        // Only unmount AFTER animation fully completes
        setMounted(false);
      });
    }
  }, [visible]);

  // Use a Modal so it sits in its own native layer — no touch bleed onto the app
  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop — tap to close */}
      <Animated.View style={[sd.backdrop, { opacity }]}>
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

        <Text style={sd.sectionLabel}>APPEARANCE</Text>
        <ThemeSwitch />

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
    </Modal>
  );
}

// ─── Custom tab bar ───────────────────────────────────────────────────────────
function BottomTabBar({ tabs, activeTab, onTabPress, onMorePress }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <View
      style={isDark
        ? [tb.wrapper, { paddingBottom: insets.bottom || 8 }]
        : [tb.wrapperFloat, { marginBottom: Math.max(insets.bottom, 8) }]}
    >
      {isDark && <View style={tb.topLine} />}
      <View style={tb.row}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[tb.tab, isActive && tb.tabActive]}
              onPress={() => onTabPress(tab.name)}
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
function AppLayout() {
  // Android draws edge-to-edge (Expo SDK 54), so the system bars overlap our content.
  // The top inset is applied ONCE here, for every screen. Screens must not add their own.
  // The bottom inset is handled by BottomTabBar (it is the bottom-most element).
  // insets.top is measured from the real window, so it is 0 where the OS already
  // keeps content below the status bar, and the inset is never counted twice.
  const insets = useSafeAreaInsets();
  useTheme();   // re-render the whole screen tree when the theme changes
  const [activeTab,    setActiveTab]    = useState('Home');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const sidebarItems = SIDEBAR_ITEMS;

  // All navigable screens = main tabs + sidebar items
  const allScreens = [...MAIN_TABS, ...sidebarItems];
  const CurrentScreen = allScreens.find(t => t.name === activeTab)?.component || HomeScreen;

  const navigate = useCallback((name) => {
    const found = allScreens.find(t => t.name === name);
    if (found) setActiveTab(name);
  }, [allScreens]);

  // A tapped push notification asks for a screen: switch to it (and close the sidebar).
  // Also delivers a tap that arrived before this layout mounted (app opened from closed).
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  React.useEffect(() => {
    return subscribeToScreenRequests(name => {
      navigateRef.current(name);
      setSidebarOpen(false);
    });
  }, []);

  const fakeNavigation = {
    navigate,
    goBack: () => {},
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, paddingTop: insets.top }}>
      <View style={{ flex: 1 }}>
        <CurrentScreen navigation={fakeNavigation} />
      </View>

      <BottomTabBar
        tabs={MAIN_TABS}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onMorePress={() => setSidebarOpen(true)}
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
  const { isDark } = useTheme();
  const navTheme = useMemo(() => ({
    ...DefaultTheme,
    dark: isDark,
    colors: { ...DefaultTheme.colors, background: COLORS.bg, card: COLORS.bg, text: COLORS.text, border: COLORS.border, primary: COLORS.gold2 },
  }), [isDark]);
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root">
          {() => <AppLayout />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const tb = themed(() => ({
  wrapper:     { backgroundColor: COLORS.tabBar, borderTopWidth: 0 },
  wrapperFloat:{ marginHorizontal: 14, borderRadius: 30, backgroundColor: COLORS.tabBar, borderWidth: 1, borderColor: COLORS.border, borderTopColor: COLORS.glassHighlight, paddingBottom: 4, ...COLORS.shadow },
  topLine:     { height: 1, backgroundColor: 'rgba(232,184,42,0.28)' },
  row:         { flexDirection: 'row', paddingHorizontal: S.sm, paddingTop: S.sm, paddingBottom: 4 },
  tab:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: RADIUS.lg, position: 'relative', minWidth: 56, borderWidth: 1, borderColor: 'transparent' },
  tabActive:   { backgroundColor: 'rgba(232,184,42,0.10)', borderColor: 'rgba(245,204,92,0.35)', borderTopColor: 'rgba(255,255,255,0.3)' },
  activeDot:   { position: 'absolute', top: -1, width: 24, height: 3, borderRadius: 2, backgroundColor: COLORS.gold3 },
  label:       { fontSize: 9, color: COLORS.dim, marginTop: 3, fontWeight: '600', letterSpacing: 0.4 },
  labelActive: { color: COLORS.gold2, fontWeight: '700' },
}));

const sd = themed(() => ({
  backdrop:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  drawer:         { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: COLORS.sheet, borderRightWidth: 1, borderRightColor: COLORS.border, paddingHorizontal: 0 },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 16 },
  logoWrap:       { width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(212,160,23,0.1)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logo:           { width: 36, height: 36 },
  appName:        { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  appSub:         { color: COLORS.muted, fontSize: 10, marginTop: 1 },
  divider:        { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20, marginVertical: 12 },
  sectionLabel:   { color: COLORS.dim, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, paddingHorizontal: 20, marginBottom: 6 },
  item:           { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 20, marginHorizontal: 10, borderRadius: RADIUS.md, marginBottom: 2, position: 'relative' },
  itemActive:     { backgroundColor: 'rgba(212,160,23,0.08)' },
  itemIco:        { width: 34, height: 34, borderRadius: 8, backgroundColor: COLORS.fillSoft, alignItems: 'center', justifyContent: 'center' },
  itemIcoActive:  { backgroundColor: 'rgba(212,160,23,0.13)' },
  itemLabel:      { color: COLORS.muted, fontSize: 13, fontWeight: '500', flex: 1 },
  itemLabelActive:{ color: COLORS.gold2, fontWeight: '700' },
  activeBar:      { position: 'absolute', right: 10, width: 3, height: 20, borderRadius: 2, backgroundColor: COLORS.gold2 },
  footer:         { color: COLORS.dim, fontSize: 9, textAlign: 'center', paddingHorizontal: 20, paddingTop: 4 },
}));

const sw = themed(() => ({
  wrap:  { flexDirection: 'row', marginHorizontal: 20, padding: 4, borderRadius: RADIUS.pill, backgroundColor: COLORS.fillSoft, borderWidth: 1, borderColor: COLORS.border },
  opt:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: 'transparent' },
  optOn: { backgroundColor: 'rgba(232,184,42,0.14)', borderColor: 'rgba(245,204,92,0.5)' },
  tx:    { color: COLORS.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  txOn:  { color: COLORS.gold3, fontWeight: '700' },
}));
