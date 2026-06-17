import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Modal, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useEvents } from '../hooks/useFirestore';
import { Loader, ErrorState, EmptyState, SectionLabel } from '../components/SharedComponents';

const { width: W } = Dimensions.get('window');

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

// ─── Event detail modal ───────────────────────────────────────────────────────
function EventDetailModal({ event, onClose }) {
  if (!event) return null;
  const tagStyle = TAG_STYLES[event.tag] || TAG_STYLES.default;

  return (
    <Modal visible={!!event} transparent animationType="slide" onRequestClose={onClose}>
      <View style={md.overlay}>
        <View style={md.sheet}>
          {/* Close button */}
          <TouchableOpacity style={md.closeBtn} onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="close" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Flyer image */}
            {!!event.imageUrl && (
              <Image
                source={{ uri: event.imageUrl }}
                style={md.flyer}
                resizeMode="cover"
              />
            )}

            <View style={md.body}>
              {/* Tag */}
              <View style={[md.tag, { backgroundColor: tagStyle.bg }]}>
                <Text style={[md.tagTx, { color: tagStyle.color }]}>{event.tag || 'Event'}</Text>
              </View>

              {/* Title */}
              <Text style={md.title}>{event.title}</Text>

              {/* Meta */}
              <View style={md.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.gold2} />
                <Text style={md.metaTx}>{formatFull(event.date)}</Text>
              </View>
              <View style={md.metaRow}>
                <Ionicons name="time-outline" size={14} color={COLORS.gold2} />
                <Text style={md.metaTx}>{formatTime(event.date)}</Text>
              </View>
              {!!event.location && (
                <View style={md.metaRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.gold2} />
                  <Text style={md.metaTx}>{event.location}</Text>
                </View>
              )}

              {/* Description */}
              {!!event.description && (
                <>
                  <View style={md.divider} />
                  <Text style={md.desc}>{event.description}</Text>
                </>
              )}

              {isComingSoon(event.date) && (
                <View style={md.soonBadge}>
                  <Ionicons name="flash" size={12} color={COLORS.gold2} />
                  <Text style={md.soonTx}>Coming up soon!</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function EventsScreen() {
  const { data, loading, error } = useEvents();
  const [selected, setSelected] = useState(null);

  const upcoming = data.filter((e) => getDate(e.date) >= new Date());
  const featured = upcoming.find((e) => e.featured) || upcoming[0];
  const rest     = upcoming.filter((e) => e.id !== featured?.id);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTx}>Live updates</Text>
          </View>
          <Text style={styles.heroTitle}>Association Events</Text>
          <Text style={styles.heroSub}>Tap any event to see full details</Text>
        </View>

        {loading && <Loader />}
        {error && <ErrorState message={error} />}
        {!loading && !error && data.length === 0 && (
          <EmptyState icon="📅" message="No upcoming events. Check back soon." />
        )}

        {featured && (
          <>
            <SectionLabel>Featured event</SectionLabel>
            <TouchableOpacity
              style={styles.bigCard}
              onPress={() => setSelected(featured)}
              activeOpacity={0.85}
            >
              {/* Flyer image */}
              {!!featured.imageUrl && (
                <Image
                  source={{ uri: featured.imageUrl }}
                  style={styles.bigImage}
                  resizeMode="cover"
                />
              )}
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
                <Text style={styles.bigDesc} numberOfLines={2}>{featured.description}</Text>
              )}
              <Text style={styles.tapHint}>Tap to see full details →</Text>
            </TouchableOpacity>
          </>
        )}

        {rest.length > 0 && <SectionLabel>All upcoming</SectionLabel>}
        {rest.map((ev) => {
          const d = getDate(ev.date);
          const tagStyle = TAG_STYLES[ev.tag] || TAG_STYLES.default;
          return (
            <TouchableOpacity
              key={ev.id}
              style={styles.evCard}
              onPress={() => setSelected(ev)}
              activeOpacity={0.75}
            >
              {/* Thumbnail if image exists */}
              {!!ev.imageUrl && (
                <Image source={{ uri: ev.imageUrl }} style={styles.evThumb} resizeMode="cover" />
              )}
              {!ev.imageUrl && (
                <View style={styles.evDate}>
                  <Text style={styles.evDay}>{d.getDate()}</Text>
                  <Text style={styles.evMon}>{d.toLocaleString('en', { month: 'short' }).toUpperCase()}</Text>
                </View>
              )}
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
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>

      <EventDetailModal event={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const S = SPACING;
const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: COLORS.bg },
  hero:        { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  liveBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(74,222,128,0.08)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.22)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  liveDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.green },
  liveTx:      { color: COLORS.green, fontSize: 10 },
  heroTitle:   { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub:     { color: COLORS.muted, fontSize: 12, marginTop: 5 },

  bigCard:     { backgroundColor: '#1e1545', borderWidth: 1, borderColor: 'rgba(212,160,23,0.24)', borderRadius: RADIUS.xl, marginHorizontal: S.lg, marginBottom: S.md, overflow: 'hidden' },
  bigImage:    { width: '100%', height: 180 },
  bigDotRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: S.sm, paddingHorizontal: S.lg, paddingTop: S.md },
  bigComingTx: { color: COLORS.gold3, fontSize: 10, letterSpacing: 0.5 },
  bigTitle:    { color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: S.sm, paddingHorizontal: S.lg },
  bigMeta:     { flexDirection: 'row', gap: S.lg, marginBottom: 4, paddingHorizontal: S.lg },
  metaItem:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: S.lg, paddingBottom: 2 },
  metaTx:      { color: COLORS.muted, fontSize: 11 },
  bigDesc:     { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: S.sm, paddingHorizontal: S.lg },
  tapHint:     { color: COLORS.gold3, fontSize: 10, textAlign: 'right', paddingHorizontal: S.lg, paddingBottom: S.md, paddingTop: S.sm },

  evCard:      { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginHorizontal: S.lg, marginBottom: 10, overflow: 'hidden' },
  evThumb:     { width: 60, height: 60, resizeMode: 'cover' },
  evDate:      { backgroundColor: 'rgba(212,160,23,0.13)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.18)', borderRadius: S.sm, paddingHorizontal: S.sm, paddingVertical: 6, alignItems: 'center', minWidth: 40, marginLeft: S.md },
  evDay:       { color: COLORS.gold2, fontSize: 17, fontWeight: '700', lineHeight: 20 },
  evMon:       { color: COLORS.dim, fontSize: 9, letterSpacing: 0.5, marginTop: 2 },
  evTitle:     { color: COLORS.text, fontSize: 13, fontWeight: '500', paddingTop: S.sm },
  evLoc:       { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3, paddingBottom: S.sm },
  evLocTx:     { color: COLORS.muted, fontSize: 11 },
  evTag:       { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: RADIUS.pill, marginRight: S.md },
  evTagTx:     { fontSize: 9, fontWeight: '600' },
});

const md = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#110d2a', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', overflow: 'hidden' },
  closeBtn:   { position: 'absolute', top: 14, right: 16, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  flyer:      { width: '100%', height: W * 0.65, resizeMode: 'cover' },
  body:       { padding: S.lg, paddingBottom: 40 },
  tag:        { alignSelf: 'flex-start', paddingHorizontal: S.md, paddingVertical: 3, borderRadius: RADIUS.pill, marginBottom: S.sm },
  tagTx:      { fontSize: 10, fontWeight: '600' },
  title:      { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: S.md },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  metaTx:     { color: COLORS.muted, fontSize: 13 },
  divider:    { height: 1, backgroundColor: COLORS.border, marginVertical: S.md },
  desc:       { color: COLORS.muted, fontSize: 13, lineHeight: 20 },
  soonBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: S.lg, backgroundColor: 'rgba(212,160,23,0.1)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.25)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 6, alignSelf: 'flex-start' },
  soonTx:     { color: COLORS.gold2, fontSize: 12, fontWeight: '600' },
});
