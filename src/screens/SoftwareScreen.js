import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Clipboard, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useSoftware } from '../hooks/useFirestore';
import { Loader, ErrorState, EmptyState } from '../components/SharedComponents';

const S = SPACING;

const CAT_COLORS = [
  { bg: 'rgba(124,58,237,0.15)', color: '#c084fc' },
  { bg: 'rgba(96,165,250,0.13)', color: '#60a5fa' },
  { bg: 'rgba(212,160,23,0.13)', color: '#f5cc5c' },
  { bg: 'rgba(74,222,128,0.11)', color: '#4ade80' },
  { bg: 'rgba(251,146,60,0.13)', color: '#fb923c' },
  { bg: 'rgba(244,114,182,0.13)',color: '#f472b6' },
];

function catColor(cat, allCats) {
  const idx = allCats.indexOf(cat) % CAT_COLORS.length;
  return CAT_COLORS[idx >= 0 ? idx : 0];
}

export default function SoftwareScreen() {
  const { data, loading, error } = useSoftware();
  const [activeCategory, setActiveCategory] = useState('All');

  // Derive categories dynamically from data
  const categories = useMemo(() => {
    const cats = [...new Set(data.map(s => s.category).filter(Boolean))].sort();
    return ['All', ...cats];
  }, [data]);

  const filtered = activeCategory === 'All'
    ? data
    : data.filter(s => s.category === activeCategory);

  function handleCopyLink(url) {
    Clipboard.setString(url);
    Alert.alert('Link copied!', 'Paste it in your PC\'s browser to download.');
  }

  function handleOpenLink(url) {
    Linking.openURL(url).catch(() =>
      Alert.alert('Cannot open link', 'Please copy the link and open it on your PC.')
    );
  }

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="desktop-outline" size={11} color={COLORS.gold3} />
          <Text style={styles.heroBadgeTx}>Desktop Programs</Text>
        </View>
        <Text style={styles.heroTitle}>Software & Tools</Text>
        <Text style={styles.heroSub}>GIS, CAD, Surveying & more</Text>
      </View>

      {/* Notice banner */}
      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.gold2} />
        <Text style={styles.noticeTx}>
          These are desktop programs — copy the link and open it in your PC's browser to download.
        </Text>
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
        <EmptyState icon="💾" message="No software available yet. Check back soon." />
      )}

      {/* Software cards */}
      {filtered.map(sw => {
        const cc = catColor(sw.category, categories.filter(c => c !== 'All'));
        return (
          <View key={sw.id} style={styles.card}>
            <View style={styles.cardTop}>
              {/* Image or icon */}
              {sw.imageUrl ? (
                <Image source={{ uri: sw.imageUrl }} style={styles.swImage} resizeMode="cover" />
              ) : (
                <View style={styles.swIconBox}>
                  <Ionicons name="desktop-outline" size={26} color={COLORS.gold2} />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.swName}>{sw.name}</Text>
                <View style={[styles.catBadge, { backgroundColor: cc.bg }]}>
                  <Text style={[styles.catBadgeTx, { color: cc.color }]}>{sw.category}</Text>
                </View>
                {!!sw.fileSize && (
                  <View style={styles.sizeRow}>
                    <Ionicons name="save-outline" size={11} color={COLORS.dim} />
                    <Text style={styles.sizeTx}>{sw.fileSize}</Text>
                  </View>
                )}
              </View>
            </View>

            {!!sw.description && (
              <Text style={styles.desc}>{sw.description}</Text>
            )}

            {/* Action buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => handleCopyLink(sw.downloadUrl)}
                activeOpacity={0.75}
              >
                <Ionicons name="copy-outline" size={15} color={COLORS.gold2} />
                <Text style={styles.copyBtnTx}>Copy Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.openBtn}
                onPress={() => handleOpenLink(sw.downloadUrl)}
                activeOpacity={0.75}
              >
                <Ionicons name="open-outline" size={15} color="#000" />
                <Text style={styles.openBtnTx}>Open Link</Text>
              </TouchableOpacity>
            </View>

            {!!sw.installVideoUrl && (
              <TouchableOpacity
                style={styles.installBtn}
                onPress={() => handleOpenLink(sw.installVideoUrl)}
                activeOpacity={0.75}
              >
                <Ionicons name="play-circle-outline" size={15} color="#c084fc" />
                <Text style={styles.installBtnTx}>Watch Install Guide</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

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

  notice:      { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: S.lg, marginTop: S.lg, marginBottom: S.sm, backgroundColor: 'rgba(212,160,23,0.08)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.22)', borderRadius: RADIUS.md, padding: S.md },
  noticeTx:    { color: COLORS.gold3, fontSize: 12, lineHeight: 18, flex: 1 },

  catRow:      { paddingHorizontal: S.lg, paddingVertical: S.sm, gap: 8 },
  catPill:     { paddingHorizontal: S.md, paddingVertical: 6, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border },
  catPillOn:   { backgroundColor: 'rgba(212,160,23,0.14)', borderColor: 'rgba(212,160,23,0.44)' },
  catTx:       { color: COLORS.muted, fontSize: 12 },
  catTxOn:     { color: COLORS.gold3, fontWeight: '600' },

  card:        { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginHorizontal: S.lg, marginBottom: 12, padding: S.md },
  cardTop:     { flexDirection: 'row', gap: S.md, marginBottom: S.sm },
  swImage:     { width: 56, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.bg },
  swIconBox:   { width: 56, height: 56, borderRadius: RADIUS.md, backgroundColor: 'rgba(212,160,23,0.1)', alignItems: 'center', justifyContent: 'center' },
  swName:      { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  catBadge:    { alignSelf: 'flex-start', paddingHorizontal: S.sm, paddingVertical: 2, borderRadius: RADIUS.pill, marginBottom: 4 },
  catBadgeTx:  { fontSize: 10, fontWeight: '600' },
  sizeRow:     { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  sizeTx:      { color: COLORS.dim, fontSize: 10 },
  desc:        { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginBottom: S.sm },

  btnRow:      { flexDirection: 'row', gap: S.sm, marginTop: S.sm },
  copyBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(212,160,23,0.35)', backgroundColor: 'rgba(212,160,23,0.07)' },
  copyBtnTx:   { color: COLORS.gold2, fontSize: 13, fontWeight: '600' },
  openBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: RADIUS.md, backgroundColor: COLORS.gold2 },
  openBtnTx:   { color: '#000', fontSize: 13, fontWeight: '700' },
  installBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(124,58,237,0.35)', backgroundColor: 'rgba(124,58,237,0.08)', marginTop: S.sm },
  installBtnTx:{ color: '#c084fc', fontSize: 13, fontWeight: '600' },
});
