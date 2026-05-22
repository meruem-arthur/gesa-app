import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Animated, Easing,
  Dimensions, Platform,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useWordOfDay, useEvents } from '../hooks/useFirestore';
import { Loader, SectionLabel } from '../components/SharedComponents';

const S = SPACING;
const { width: W, height: H } = Dimensions.get('window');

const GESA_LOGO = require('../assets/gesa-logo.jpg');

// ─── Single animated wave strip ───────────────────────────────────────────────
// Moves horizontally across the screen, blurred, semi-transparent
function WaveStrip({ color, opacity, yPercent, amplitude, speed, delay, blurAmount }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Horizontal drift — moves left across screen continuously
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -W,
        duration: speed,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Vertical gentle bob
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: amplitude,
          duration: speed * 0.4,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -amplitude,
          duration: speed * 0.4,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const yPos = yPercent * H;

  // Two copies side by side so the loop is seamless
  const wavePath = `M0,${amplitude} C${W*0.15},${-amplitude} ${W*0.35},${amplitude*2} ${W*0.5},${amplitude} C${W*0.65},${-amplitude} ${W*0.85},${amplitude*2} ${W},${amplitude} L${W},80 L0,80 Z`;
  const wavePathB = `M${W},${amplitude} C${W*1.15},${-amplitude} ${W*1.35},${amplitude*2} ${W*1.5},${amplitude} C${W*1.65},${-amplitude} ${W*1.85},${amplitude*2} ${W*2},${amplitude} L${W*2},80 L${W},80 Z`;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          top: yPos - 40,
          height: 80 + amplitude * 2,
          transform: [{ translateX }, { translateY }],
          width: W * 2,
        },
      ]}
      pointerEvents="none"
    >
      <Svg width={W * 2} height={80 + amplitude * 2} viewBox={`0 0 ${W * 2} ${80 + amplitude * 2}`}>
        <Defs>
          <LinearGradient id={`wg-${yPercent}-${delay}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={String(opacity)} />
            <Stop offset="0.6" stopColor={color} stopOpacity={String(opacity * 0.5)} />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path
          d={`M0,${amplitude} C${W*0.15},${-amplitude} ${W*0.35},${amplitude*2} ${W*0.5},${amplitude} C${W*0.65},${-amplitude} ${W*0.85},${amplitude*2} ${W},${amplitude} C${W*1.15},${-amplitude} ${W*1.35},${amplitude*2} ${W*1.5},${amplitude} C${W*1.65},${-amplitude} ${W*1.85},${amplitude*2} ${W*2},${amplitude} L${W*2},${80+amplitude*2} L0,${80+amplitude*2} Z`}
          fill={`url(#wg-${yPercent}-${delay})`}
        />
      </Svg>
    </Animated.View>
  );
}

// ─── Full-screen wave background ──────────────────────────────────────────────
function WaveBackground() {
  const waves = [
    // Purple waves
    { color: '#7c3aed', opacity: 0.45, yPercent: 0.08, amplitude: 22, speed: 8000,  delay: 0    },
    { color: '#6d28d9', opacity: 0.35, yPercent: 0.18, amplitude: 18, speed: 10000, delay: 1200 },
    { color: '#5b21b6', opacity: 0.30, yPercent: 0.28, amplitude: 25, speed: 7000,  delay: 600  },
    // Gold waves — more prominent
    { color: '#d4a017', opacity: 0.50, yPercent: 0.38, amplitude: 20, speed: 9000,  delay: 400  },
    { color: '#e8b82a', opacity: 0.40, yPercent: 0.48, amplitude: 28, speed: 11000, delay: 2000 },
    { color: '#f5cc5c', opacity: 0.35, yPercent: 0.55, amplitude: 16, speed: 6500,  delay: 800  },
    // Deep purple
    { color: '#4c1d95', opacity: 0.40, yPercent: 0.65, amplitude: 22, speed: 8500,  delay: 1600 },
    // More gold lower
    { color: '#d4a017', opacity: 0.45, yPercent: 0.73, amplitude: 18, speed: 7500,  delay: 300  },
    { color: '#e8b82a', opacity: 0.30, yPercent: 0.82, amplitude: 24, speed: 12000, delay: 900  },
    // Final purple
    { color: '#7c3aed', opacity: 0.35, yPercent: 0.90, amplitude: 20, speed: 9500,  delay: 1800 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Dark base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#07050f' }]} />

      {/* Wave strips */}
      {waves.map((w, i) => (
        <WaveStrip key={i} {...w} />
      ))}

      {/* Blur overlay for depth */}
      <BlurView
        intensity={18}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDate(val) {
  if (!val) return new Date();
  return val.toDate ? val.toDate() : new Date(val);
}
function isComingSoon(val) {
  const diff = (getDate(val) - new Date()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { word, loading: wLoad } = useWordOfDay();
  const { data: events, loading: eLoad } = useEvents();

  const upcoming = events
    .filter(e => getDate(e.date) >= new Date())
    .slice(0, 4);

  return (
    <View style={{ flex: 1 }}>
      {/* Full screen wave background — behind everything */}
      <WaveBackground />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={GESA_LOGO} style={styles.logo} resizeMode="contain" />
          <View style={styles.heroBadge}>
            <Ionicons name="flash" size={11} color={COLORS.gold3} />
            <Text style={styles.heroBadgeTx}>UMaT · Essikado Campus</Text>
          </View>
          <Text style={styles.heroTitle}>Geomatic Engineering{'\n'}Students Association</Text>
          <Text style={styles.heroSub}>Welcome back, member</Text>
        </View>

        {/* Word of the day */}
        <View style={{ paddingHorizontal: S.lg, paddingTop: S.lg }}>
          {wLoad ? <Loader /> : word ? (
            <View style={styles.wotd}>
              <Text style={styles.wotdLbl}>✦  WORD OF THE DAY</Text>
              <Text style={styles.wotdWord}>{word.word}</Text>
              <Text style={styles.wotdType}>{word.type || 'noun · Geomatics'}</Text>
              <Text style={styles.wotdDef}>{word.definition}</Text>
              {!!word.example && <Text style={styles.wotdEx}>{word.example}</Text>}
            </View>
          ) : null}
        </View>

        {/* Quick access */}
        <SectionLabel>Quick access</SectionLabel>
        <View style={styles.qgrid}>
          {[
            { label: 'Announcements', sub: 'Latest notices',  icon: 'notifications-outline', to: 'Notice'    },
            { label: 'Leadership',    sub: 'Exco & Lecturers',icon: 'people-outline',         to: 'Leaders'   },
            { label: 'Materials',     sub: 'Level 100–400',   icon: 'book-outline',           to: 'Materials' },
            { label: 'Past Questions',sub: 'All years',        icon: 'document-text-outline', to: 'PastQ'     },
            { label: 'Exam Countdown',sub: 'Live timer',       icon: 'alarm-outline',         to: 'Exams'     },
            { label: 'Forum',         sub: 'Q&A · Anonymous', icon: 'chatbubbles-outline',    to: 'Forum'     },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.qcard}
              onPress={() => navigation.navigate(item.to)}
              activeOpacity={0.75}
            >
              <View style={styles.qiconBox}>
                <Ionicons name={item.icon} size={18} color={COLORS.gold2} />
              </View>
              <Text style={styles.qtitle}>{item.label}</Text>
              <Text style={styles.qsub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming events */}
        <SectionLabel>Upcoming events</SectionLabel>
        {eLoad ? <Loader /> : upcoming.length === 0
          ? <Text style={styles.empty}>No upcoming events. Check back soon.</Text>
          : upcoming.map(ev => {
              const d = getDate(ev.date);
              return (
                <TouchableOpacity
                  key={ev.id}
                  style={styles.evRow}
                  onPress={() => navigation.navigate('Events')}
                  activeOpacity={0.75}
                >
                  <View style={styles.evDate}>
                    <Text style={styles.evDay}>{d.getDate()}</Text>
                    <Text style={styles.evMon}>{d.toLocaleString('en', { month: 'short' }).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.evTitle}>{ev.title}</Text>
                    <Text style={styles.evLoc}>{ev.location}</Text>
                  </View>
                  {isComingSoon(ev.date) && (
                    <View style={styles.soonTag}><Text style={styles.soonTx}>Soon</Text></View>
                  )}
                </TouchableOpacity>
              );
            })
        }

        {/* Footer */}
        <View style={styles.footer}>
          <Image source={GESA_LOGO} style={styles.footerLogo} resizeMode="contain" />
          <View>
            <Text style={styles.footerTitle}>GESA UMaT · The Eye of the Engineer</Text>
            <Text style={styles.footerSub}>Geomatic Engineering Students Association · Essikado Campus</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: 'transparent' },
  hero:         { paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  logo:         { width: 84, height: 84, borderRadius: 42, marginBottom: S.md, borderWidth: 2, borderColor: 'rgba(212,160,23,0.5)', backgroundColor: '#fff' },
  heroBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.15)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.35)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  heroBadgeTx:  { color: COLORS.gold3, fontSize: 10 },
  heroTitle:    { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 27, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  heroSub:      { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 5 },

  wotd:         { backgroundColor: 'rgba(30,21,69,0.85)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.25)', borderRadius: RADIUS.xl, padding: S.lg },
  wotdLbl:      { color: COLORS.gold3, fontSize: 9, letterSpacing: 2, marginBottom: S.sm },
  wotdWord:     { color: COLORS.text, fontSize: 22, fontWeight: '700' },
  wotdType:     { color: COLORS.gold2, fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  wotdDef:      { color: COLORS.muted, fontSize: 13, lineHeight: 20, marginTop: S.sm },
  wotdEx:       { color: COLORS.dim, fontSize: 12, fontStyle: 'italic', marginTop: S.sm, paddingLeft: S.sm, borderLeftWidth: 2, borderLeftColor: 'rgba(212,160,23,0.28)', lineHeight: 18 },

  qgrid:        { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: S.lg, gap: 10 },
  qcard:        { width: '47.5%', backgroundColor: 'rgba(23,19,46,0.80)', borderWidth: 1, borderColor: 'rgba(180,130,255,0.15)', borderRadius: RADIUS.lg, padding: S.md },
  qiconBox:     { width: 33, height: 33, backgroundColor: 'rgba(212,160,23,0.14)', borderRadius: S.sm, alignItems: 'center', justifyContent: 'center', marginBottom: S.sm },
  qtitle:       { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  qsub:         { color: COLORS.muted, fontSize: 10, marginTop: 2 },

  evRow:        { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: 'rgba(23,19,46,0.80)', borderWidth: 1, borderColor: 'rgba(180,130,255,0.15)', borderRadius: RADIUS.md, marginHorizontal: S.lg, marginBottom: 10, padding: S.md },
  evDate:       { backgroundColor: 'rgba(212,160,23,0.13)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.18)', borderRadius: S.sm, paddingHorizontal: S.sm, paddingVertical: 6, alignItems: 'center', minWidth: 40 },
  evDay:        { color: COLORS.gold2, fontSize: 17, fontWeight: '700', lineHeight: 20 },
  evMon:        { color: COLORS.dim, fontSize: 9, letterSpacing: 0.5, marginTop: 2 },
  evTitle:      { color: COLORS.text, fontSize: 13, fontWeight: '500' },
  evLoc:        { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  soonTag:      { backgroundColor: 'rgba(212,160,23,0.13)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.2)', borderRadius: RADIUS.pill, paddingHorizontal: S.sm, paddingVertical: 3 },
  soonTx:       { color: COLORS.gold3, fontSize: 9 },
  empty:        { color: COLORS.dim, fontSize: 13, textAlign: 'center', padding: S.xl },

  footer:       { flexDirection: 'row', alignItems: 'center', gap: S.md, marginHorizontal: S.lg, marginTop: S.lg, backgroundColor: 'rgba(212,160,23,0.08)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.2)', borderRadius: RADIUS.lg, padding: S.md },
  footerLogo:   { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(212,160,23,0.3)', backgroundColor: '#fff' },
  footerTitle:  { color: COLORS.gold2, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  footerSub:    { color: COLORS.dim, fontSize: 10, marginTop: 2 },
});
