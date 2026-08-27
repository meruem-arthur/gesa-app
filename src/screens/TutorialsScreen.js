import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Clipboard, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useTutorials } from '../hooks/useFirestore';
import { Loader, ErrorState, EmptyState } from '../components/SharedComponents';

const S = SPACING;

export default function TutorialsScreen() {
  const { data, loading, error } = useTutorials();
  const [activeCategory, setActiveCategory] = useState('All');

  // Derive categories dynamically from data (grouped by software name)
  const categories = useMemo(() => {
    const cats = [...new Set(data.map(t => t.software).filter(Boolean))].sort();
    return ['All', ...cats];
  }, [data]);

  const filtered = activeCategory === 'All'
    ? data
    : data.filter(t => t.software === activeCategory);

  function handleCopyLink(url) {
    Clipboard.setString(url);
    Alert.alert('Link copied!', 'Paste it in your browser or share it with a friend.');
  }

  function handleWatch(url) {
    Linking.openURL(url).catch(() =>
      Alert.alert('Cannot open link', 'Please copy the link and open it in YouTube.')
    );
  }

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="play-circle-outline" size={11} color={COLORS.gold3} />
          <Text style={styles.heroBadgeTx}>Video Guides</Text>
        </View>
        <Text style={styles.heroTitle}>Tutorials</Text>
        <Text style={styles.heroSub}>Learn how to use the tools</Text>
      </View>

      {/* Category filter pills — derived from data */}
      {categories.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, activeCategory === cat && styles.catPillOn]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.catTx, activeCategory === cat && styles.catTxOn]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading && <Loader />}
      {error && <ErrorState message={error} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState icon="▶️" message="No tutorials available yet. Check back soon." />
      )}

      {/* Tutorial cards */}
      {filtered.map(tut => (
        <View key={tut.id} style={styles.card}>
          {tut.thumbnailUrl ? (
            <Image source={{ uri: tut.thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbFallback}>
              <Ionicons name="play-circle" size={36} color={COLORS.gold2} />
            </View>
          )}

          <View style={styles.cardBody}>
            <Text style={styles.tutTitle}>{tut.title}</Text>
            {!!tut.software && (
              <View style={styles.swBadge}>
                <Text style={styles.swBadgeTx}>{tut.software}</Text>
              </View>
            )}
            {!!tut.description && (
              <Text style={styles.desc}>{tut.description}</Text>
            )}

            {/* Action buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => handleCopyLink(tut.youtubeUrl)}
                activeOpacity={0.75}
              >
                <Ionicons name="copy-outline" size={15} color={COLORS.gold2} />
                <Text style={styles.copyBtnTx}>Copy Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.watchBtn}
                onPress={() => handleWatch(tut.youtubeUrl)}
                activeOpacity={0.75}
              >
                <Ionicons name="play" size={15} color="#000" />
                <Text style={styles.watchBtnTx}>Watch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: COLORS.bg },
  hero:        { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  heroBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  heroBadgeTx: { color: COLORS.gold3, fontSize: 10 },
  heroTitle:   { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub:     { color: COLORS.muted, fontSize: 12, marginTop: 5 },

  catRow:      { paddingHorizontal: S.lg, paddingVertical: S.sm, gap: 8 },
  catPill:     { paddingHorizontal: S.md, paddingVertical: 6, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border },
  catPillOn:   { backgroundColor: 'rgba(212,160,23,0.14)', borderColor: 'rgba(212,160,23,0.44)' },
  catTx:       { color: COLORS.muted, fontSize: 12 },
  catTxOn:     { color: COLORS.gold3, fontWeight: '600' },

  card:        { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginHorizontal: S.lg, marginBottom: 12, overflow: 'hidden' },
  thumb:       { width: '100%', height: 160, backgroundColor: COLORS.bg },
  thumbFallback: { width: '100%', height: 120, backgroundColor: 'rgba(212,160,23,0.08)', alignItems: 'center', justifyContent: 'center' },
  cardBody:    { padding: S.md },
  tutTitle:    { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  swBadge:     { alignSelf: 'flex-start', backgroundColor: 'rgba(124,58,237,0.15)', paddingHorizontal: S.sm, paddingVertical: 2, borderRadius: RADIUS.pill, marginBottom: 6 },
  swBadgeTx:   { color: '#c084fc', fontSize: 10, fontWeight: '600' },
  desc:        { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginBottom: S.sm },

  btnRow:      { flexDirection: 'row', gap: S.sm, marginTop: S.sm },
  copyBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(212,160,23,0.35)', backgroundColor: 'rgba(212,160,23,0.07)' },
  copyBtnTx:   { color: COLORS.gold2, fontSize: 13, fontWeight: '600' },
  watchBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: RADIUS.md, backgroundColor: COLORS.gold2 },
  watchBtnTx:  { color: '#000', fontSize: 13, fontWeight: '700' },
});
