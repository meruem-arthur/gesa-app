import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAnnouncements } from '../hooks/useFirestore';
import { Loader, ErrorState, EmptyState } from '../components/SharedComponents';

const TAG_COLORS = {
  purple: { bg: 'rgba(168,85,247,0.18)',  text: '#c084fc', dot: '#a855f7', border: 'rgba(168,85,247,0.3)'  },
  gold:   { bg: 'rgba(212,160,23,0.12)',  text: '#f5cc5c', dot: '#e8b82a', border: 'rgba(212,160,23,0.25)' },
  amber:  { bg: 'rgba(245,158,11,0.10)',  text: '#f59e0b', dot: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
  blue:   { bg: 'rgba(96,165,250,0.10)',  text: '#60a5fa', dot: '#60a5fa', border: 'rgba(96,165,250,0.3)'  },
  green:  { bg: 'rgba(74,222,128,0.10)',  text: '#4ade80', dot: '#4ade80', border: 'rgba(74,222,128,0.3)'  },
};

function timeAgo(val) {
  if (!val) return '';
  const d = val.toDate ? val.toDate() : new Date(val);
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AnnouncementsScreen() {
  const { data, loading, error } = useAnnouncements();

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="notifications-outline" size={11} color={COLORS.p300} />
          <Text style={styles.heroBadgeTx}>Notices & Updates</Text>
        </View>
        <Text style={styles.heroTitle}>Announcements</Text>
        <Text style={styles.heroSub}>From GESA executives & department</Text>
      </View>

      <View style={{ height: 12 }} />

      {loading && <Loader />}
      {error && <ErrorState message={error} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState icon="📭" message="No announcements yet. Check back soon." />
      )}

      {data.map((ann) => {
        const palette = TAG_COLORS[ann.color] || TAG_COLORS.purple;
        return (
          <View key={ann.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.dot, { backgroundColor: palette.dot }]} />
              <Text style={styles.cardTitle}>{ann.title}</Text>
              <View style={[styles.tag, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                <Text style={[styles.tagTx, { color: palette.text }]}>{ann.tag}</Text>
              </View>
            </View>
            <Text style={styles.cardBody}>{ann.body}</Text>
            <View style={styles.cardMeta}>
              <Ionicons name="time-outline" size={11} color={COLORS.dim} />
              <Text style={styles.cardMetaTx}>{timeAgo(ann.createdAt)} · {ann.author || 'GESA'}</Text>
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
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 1, borderColor: 'rgba(168,85,247,0.35)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  heroBadgeTx: { color: COLORS.p300, fontSize: 10 },
  heroTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub: { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginHorizontal: S.lg, marginBottom: 10, padding: S.lg },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.sm },
  dot: { width: 7, height: 7, borderRadius: 4 },
  cardTitle: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1 },
  tag: { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: RADIUS.pill, borderWidth: 1 },
  tagTx: { fontSize: 9, fontWeight: '600' },
  cardBody: { color: COLORS.muted, fontSize: 12, lineHeight: 19 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: S.sm },
  cardMetaTx: { color: COLORS.dim, fontSize: 10 },
});
