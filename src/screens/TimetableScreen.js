import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection, query, where, getDocs, orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Loader, ErrorState, EmptyState, PillRow, TabRow } from '../components/SharedComponents';

const S = SPACING;

const LEVELS = [
  { label: 'Level 100', value: 100 },
  { label: 'Level 200', value: 200 },
  { label: 'Level 300', value: 300 },
  { label: 'Level 400', value: 400 },
];

const SEMESTERS = [
  { label: 'Semester 1', value: 1 },
  { label: 'Semester 2', value: 2 },
];

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const DAY_COLORS = {
  MONDAY:    '#7c3aed',
  TUESDAY:   '#d4a017',
  WEDNESDAY: '#2563eb',
  THURSDAY:  '#059669',
  FRIDAY:    '#dc2626',
  SATURDAY:  '#7c3aed',
};

const VENUE_ICONS = {
  'ONLINE':     'wifi-outline',
  'FIELD':      'compass-outline',
  'LAB':        'flask-outline',
  'AUDITORIUM': 'business-outline',
};

function getVenueIcon(venue) {
  const v = (venue || '').toUpperCase();
  for (const [key, icon] of Object.entries(VENUE_ICONS)) {
    if (v.includes(key)) return icon;
  }
  return 'location-outline';
}

function CourseCard({ slot }) {
  const color = DAY_COLORS[slot.day] || COLORS.purple;
  const venueIcon = getVenueIcon(slot.venue);
  const isOnline = slot.venue?.toUpperCase().includes('ONLINE');
  const isField  = slot.venue?.toUpperCase().includes('FIELD');

  return (
    <View style={[cc.card, { borderLeftColor: color }]}>
      <View style={cc.top}>
        <View style={[cc.timeBadge, { backgroundColor: color + '22' }]}>
          <Ionicons name="time-outline" size={11} color={color} />
          <Text style={[cc.timeText, { color }]}>{slot.time}</Text>
        </View>
        {(isOnline || isField) && (
          <View style={[cc.modeBadge, { backgroundColor: isOnline ? 'rgba(96,165,250,0.15)' : 'rgba(74,222,128,0.15)' }]}>
            <Ionicons name={venueIcon} size={10} color={isOnline ? COLORS.blue : COLORS.green} />
            <Text style={[cc.modeText, { color: isOnline ? COLORS.blue : COLORS.green }]}>
              {isOnline ? 'Online' : 'Field Work'}
            </Text>
          </View>
        )}
      </View>

      <Text style={cc.code}>{slot.code}</Text>
      {!!slot.name && <Text style={cc.name}>{slot.name}</Text>}

      <View style={cc.bottom}>
        <View style={cc.venueRow}>
          <Ionicons name={venueIcon} size={12} color={COLORS.muted} />
          <Text style={cc.venue}>{slot.venue}</Text>
        </View>
        {!!slot.lecturer && (
          <View style={cc.lecRow}>
            <Ionicons name="person-outline" size={12} color={COLORS.dim} />
            <Text style={cc.lec}>{slot.lecturer}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function DaySection({ day, slots }) {
  const color = DAY_COLORS[day] || COLORS.purple;
  return (
    <View style={ds.container}>
      <View style={[ds.header, { borderLeftColor: color }]}>
        <Text style={[ds.dayText, { color }]}>{day}</Text>
        <Text style={ds.count}>{slots.length} class{slots.length !== 1 ? 'es' : ''}</Text>
      </View>
      {slots.map((slot, i) => (
        <CourseCard key={i} slot={slot} />
      ))}
    </View>
  );
}

export default function TimetableScreen() {
  const [level,    setLevel]    = useState(100);
  const [semester, setSemester] = useState(2);
  const [slots,    setSlots]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, [level, semester]);

  async function fetchTimetable() {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'timetable'),
        where('level',    '==', level),
        where('semester', '==', semester),
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSlots(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Group by day in correct order
  const byDay = {};
  DAYS.forEach(d => { byDay[d] = []; });
  slots.forEach(s => {
    const day = (s.day || '').toUpperCase();
    if (byDay[day]) byDay[day].push(s);
  });

  // Sort each day's slots chronologically using sortOrder (falls back to time-string parse for old data without it)
  DAYS.forEach(day => {
    byDay[day].sort((a, b) => {
      if (a.sortOrder != null && b.sortOrder != null) {
        return a.sortOrder - b.sortOrder;
      }
      const timeA = a.time?.split(':')[0] || '0';
      const timeB = b.time?.split(':')[0] || '0';
      return parseInt(timeA) - parseInt(timeB);
    });
  });

  const activeDays = DAYS.filter(d => byDay[d].length > 0);
  const totalClasses = slots.length;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="calendar-outline" size={11} color={COLORS.gold3} />
          <Text style={styles.heroBadgeTx}>GM · SRID Campus</Text>
        </View>
        <Text style={styles.heroTitle}>Class Timetable</Text>
        <Text style={styles.heroSub}>Geomatic Engineering · UMaT</Text>
      </View>

      {/* Filters */}
      <PillRow options={LEVELS}   selected={level}    onSelect={setLevel}    />
      <TabRow  tabs={SEMESTERS}   selected={semester} onSelect={setSemester} />

      {/* Summary bar */}
      {!loading && !error && totalClasses > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{totalClasses}</Text>
            <Text style={styles.summaryLbl}>Classes</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{activeDays.length}</Text>
            <Text style={styles.summaryLbl}>Days</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>
              {slots.filter(s => s.venue?.toUpperCase().includes('ONLINE')).length}
            </Text>
            <Text style={styles.summaryLbl}>Online</Text>
          </View>
        </View>
      )}

      {/* Content */}
      <View style={{ paddingHorizontal: S.lg, paddingBottom: 32 }}>
        {loading && <Loader />}
        {error   && <ErrorState message={error} />}
        {!loading && !error && slots.length === 0 && (
          <EmptyState icon="📅" message="No timetable uploaded yet for this level and semester." />
        )}
        {!loading && !error && activeDays.map(day => (
          <DaySection key={day} day={day} slots={byDay[day]} />
        ))}
      </View>
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: COLORS.bg },
  hero:         { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  heroBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  heroBadgeTx:  { color: COLORS.gold3, fontSize: 10 },
  heroTitle:    { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub:      { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  summaryBar:   { flexDirection: 'row', marginHorizontal: S.lg, marginTop: S.md, marginBottom: S.sm, backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: S.md },
  summaryItem:  { flex: 1, alignItems: 'center' },
  summaryNum:   { color: COLORS.gold2, fontSize: 20, fontWeight: '800' },
  summaryLbl:   { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: COLORS.border },
});

const ds = StyleSheet.create({
  container: { marginBottom: S.lg },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, paddingLeft: S.sm, marginBottom: S.sm, marginTop: S.md },
  dayText:   { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  count:     { fontSize: 11, color: COLORS.dim },
});

const cc = StyleSheet.create({
  card:      { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, borderLeftWidth: 3, padding: S.md, marginBottom: 8 },
  top:       { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.sm },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: RADIUS.pill, paddingHorizontal: S.sm, paddingVertical: 3 },
  timeText:  { fontSize: 11, fontWeight: '700' },
  modeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: RADIUS.pill, paddingHorizontal: S.sm, paddingVertical: 3 },
  modeText:  { fontSize: 10, fontWeight: '600' },
  code:      { color: COLORS.gold3, fontSize: 13, fontWeight: '800', marginBottom: 2 },
  name:      { color: COLORS.text, fontSize: 13, fontWeight: '500', marginBottom: S.sm },
  bottom:    { flexDirection: 'row', gap: S.lg, flexWrap: 'wrap', marginTop: 4 },
  venueRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  venue:     { color: COLORS.muted, fontSize: 11 },
  lecRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lec:       { color: COLORS.dim, fontSize: 11 },
});
