import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useEvents } from '../hooks/useFirestore';
import { Loader, ErrorState, EmptyState, SectionLabel } from '../components/SharedComponents';

function getDate(val) {
  return val?.toDate ? val.toDate() : new Date(val);
}

function formatFull(val) {
  return getDate(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(val) {
  return getDate(val).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function isComingSoon(val) {
  const diff = (getDate(val) - new Date()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

const TAG_STYLES = {
  General:  { bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  Academic: { bg: 'rgba(96,165,250,0.13)',  color: '#60a5fa' },
  Formal:   { bg: 'rgba(212,160,23,0.13)',  color: '#f5cc5c' },
  Social:   { bg: 'rgba(74,222,128,0.11)',  color: '#4ade80' },
  default:  { bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
};

export default function EventsScreen() {
  const { data, loading, error } = useEvents();

  const upcoming = data.filter((e) => getDate(e.date) >= new Date());
  const featured = upcoming.find((e) => e.featured) || upcoming[0];
  const rest = upcoming.filter((e) => e.id !== featured?.id);

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTx}>Live updates</Text>
        </View>
        <Text style={styles.heroTitle}>Association Events</Text>
        <Text style={styles.heroSub}>Stay connected with GESA activities</Text>
      </View>

      {loading && <Loader />}
      {error && <ErrorState message={error} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState icon="📅" message="No upcoming events. Check back soon." />
      )}

      {featured && (
        <>
          <SectionLabel>Featured event</SectionLabel>
          <View style={styles.bigCard}>
            <View style={styles.bigDotRow}>
              <View style={[styles.liveDot, { backgroundColor: COLORS.gold2 }]} />
              <Text style={styles.bigComingTx}>Coming up — {formatFull(featured.date)}</Text>
            </View>
            <Text style={styles.bigTitle}>{featured.title}</Text>
            <View style={styles.bigMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={13} color={COLORS.muted} />
                <Text style={styles.metaTx}>{formatFull(featured.date)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={COLORS.muted} />
                <Text style={styles.metaTx}>{formatTime(featured.date)}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={COLORS.muted} />
              <Text style={styles.metaTx}>{featured.location}</Text>
            </View>
            {!!featured.description && (
              <Text style={styles.bigDesc}>{featured.description}</Text>
            )}
          </View>
        </>
      )}

      {rest.length > 0 && <SectionLabel>All upcoming</SectionLabel>}
      {rest.map((ev) => {
        const d = getDate(ev.date);
        const tagStyle = TAG_STYLES[ev.tag] || TAG_STYLES.default;
        return (
          <View key={ev.id} style={styles.evCard}>
            <View style={styles.evDate}>
              <Text style={styles.evDay}>{d.getDate()}</Text>
              <Text style={styles.evMon}>{d.toLocaleString('en', { month: 'short' }).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.evTitle}>{ev.title}</Text>
              <View style={styles.evLoc}>
                <Ionicons name="location-outline" size={11} color={COLORS.muted} />
                <Text style={styles.evLocTx}>{ev.location}</Text>
              </View>
            </View>
            <View style={[styles.evTag, { backgroundColor: tagStyle.bg }]}>
              <Text style={[styles.evTagTx, { color: tagStyle.color }]}>{ev.tag || 'Event'}</Text>
            </View>
          </View>
        );
      })}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const S = SPACING;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  hero: { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(74,222,128,0.08)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.22)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.green },
  liveTx: { color: COLORS.green, fontSize: 10 },
  heroTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub: { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  bigCard: { backgroundColor: '#1e1545', borderWidth: 1, borderColor: 'rgba(212,160,23,0.24)', borderRadius: RADIUS.xl, marginHorizontal: S.lg, marginBottom: S.md, padding: S.lg },
  bigDotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: S.sm },
  bigComingTx: { color: COLORS.gold3, fontSize: 10, letterSpacing: 0.5 },
  bigTitle: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: S.sm },
  bigMeta: { flexDirection: 'row', gap: S.lg, marginBottom: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTx: { color: COLORS.muted, fontSize: 11 },
  bigDesc: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: S.sm },
  evCard: { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginHorizontal: S.lg, marginBottom: 10, padding: S.md },
  evDate: { backgroundColor: 'rgba(212,160,23,0.13)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.18)', borderRadius: S.sm, paddingHorizontal: S.sm, paddingVertical: 6, alignItems: 'center', minWidth: 40 },
  evDay: { color: COLORS.gold2, fontSize: 17, fontWeight: '700', lineHeight: 20 },
  evMon: { color: COLORS.dim, fontSize: 9, letterSpacing: 0.5, marginTop: 2 },
  evTitle: { color: COLORS.text, fontSize: 13, fontWeight: '500' },
  evLoc: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  evLocTx: { color: COLORS.muted, fontSize: 11 },
  evTag: { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: RADIUS.pill },
  evTagTx: { fontSize: 9, fontWeight: '600' },
});
