import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet, Image,
  ImageBackground, BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useBusinesses, useSiteContent } from '../hooks/useFirestore';
import { Loader, ErrorState, OfflineBanner, appRefreshControl } from '../components/SharedComponents';

const S = SPACING;
const DEFAULT_TITLE = 'Get in touch with student business entrepreneurs in GESA';

// "024 000 0001" / "+233 24 000 0001" / "0240000001" → "233240000001"
function toWhatsAppNumber(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '233' + d.slice(1);
  return d;
}
const toTel = (raw) => `tel:${String(raw || '').replace(/[^\d+]/g, '')}`;

// "amaskitchen.com" or "https://…" → a safe https link; other schemes are rejected.
function toWebHref(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(v)) return '';
  return `https://${v}`;
}

// Logo, or the business's first letter when there is none.
function Logo({ business, size }) {
  const letter = (business.name || '?').trim().slice(0, 1).toUpperCase();
  const box = { width: size, height: size, borderRadius: RADIUS.md };
  return business.logoUrl ? (
    <Image source={{ uri: business.logoUrl }} style={[styles.logo, box]} resizeMode="contain" />
  ) : (
    <View style={[styles.logo, styles.logoFallback, box]}>
      <Text style={[styles.logoLetter, { fontSize: size * 0.42 }]}>{letter}</Text>
    </View>
  );
}

function Hero({ site }) {
  const title = site.data?.businessHeroTitle || DEFAULT_TITLE;
  const subtitle = site.data?.businessHeroSubtitle;
  const imageUrl = site.data?.businessHeroImageUrl;
  const inner = (
    <View style={styles.heroInner}>
      <View style={styles.heroBadge}>
        <Ionicons name="storefront-outline" size={11} color={COLORS.gold3} />
        <Text style={styles.heroBadgeTx}>Business Hub</Text>
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.heroSub}>{subtitle}</Text>}
    </View>
  );
  return imageUrl ? (
    <ImageBackground source={{ uri: imageUrl }} style={styles.hero} resizeMode="cover">
      <View style={styles.heroScrim}>{inner}</View>
    </ImageBackground>
  ) : (
    <View style={[styles.hero, { backgroundColor: '#1c1048' }]}>{inner}</View>
  );
}

function BusinessCard({ business, onPress }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Logo business={business} size={64} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={2}>{business.name}</Text>
        {!!business.shortDescription && (
          <Text style={styles.desc} numberOfLines={3}>{business.shortDescription}</Text>
        )}
        <Text style={styles.more}>View details →</Text>
      </View>
    </TouchableOpacity>
  );
}

function BusinessDetail({ business, onBack }) {
  const wa = toWhatsAppNumber(business.whatsapp || business.phone);
  const webHref = toWebHref(business.website);
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backRow} onPress={onBack} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={18} color={COLORS.gold2} />
        <Text style={styles.backTx}>All businesses</Text>
      </TouchableOpacity>

      <View style={styles.detailHead}>
        <Logo business={business} size={88} />
        <View style={{ flex: 1 }}>
          <Text style={styles.detailEyebrow}>STUDENT BUSINESS</Text>
          <Text style={styles.detailName}>{business.name}</Text>
          {!!business.shortDescription && <Text style={styles.detailShort}>{business.shortDescription}</Text>}
        </View>
      </View>

      <View style={styles.body}>
        {!!business.description && (
          <>
            <Text style={styles.sectionLabel}>ABOUT THE BUSINESS</Text>
            <Text style={styles.p}>{business.description}</Text>
          </>
        )}

        <View style={styles.contactCard}>
          <Text style={styles.sectionLabel}>GET IN TOUCH</Text>
          {!!business.phone && <Text style={styles.contactLine}>{business.phone}</Text>}
          {!!business.email && <Text style={styles.contactLine}>{business.email}</Text>}
          {!!webHref && <Text style={styles.contactLine}>{business.website}</Text>}
          <View style={styles.btnRow}>
            {!!business.phone && (
              <TouchableOpacity style={[styles.btn, styles.btnGold]} activeOpacity={0.85}
                onPress={() => Linking.openURL(toTel(business.phone))}>
                <Ionicons name="call" size={16} color="#1a1200" />
                <Text style={styles.btnGoldTx}>Call</Text>
              </TouchableOpacity>
            )}
            {!!wa && (
              <TouchableOpacity style={[styles.btn, styles.btnOutline]} activeOpacity={0.85}
                onPress={() => Linking.openURL(`https://wa.me/${wa}`)}>
                <Ionicons name="logo-whatsapp" size={16} color={COLORS.green} />
                <Text style={styles.btnOutlineTx}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            {!!business.email && (
              <TouchableOpacity style={[styles.btn, styles.btnOutline]} activeOpacity={0.85}
                onPress={() => Linking.openURL(`mailto:${business.email}`)}>
                <Ionicons name="mail-outline" size={16} color={COLORS.gold2} />
                <Text style={styles.btnOutlineTx}>Email</Text>
              </TouchableOpacity>
            )}
            {!!webHref && (
              <TouchableOpacity style={[styles.btn, styles.btnOutline]} activeOpacity={0.85}
                onPress={() => Linking.openURL(webHref)}>
                <Ionicons name="globe-outline" size={16} color={COLORS.gold2} />
                <Text style={styles.btnOutlineTx}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!!business.ownerPhotoUrl && (
          <View style={styles.ownerCard}>
            <Text style={styles.sectionLabel}>THE OWNER</Text>
            <Image source={{ uri: business.ownerPhotoUrl }} style={styles.ownerPhoto} resizeMode="cover" />
            {!!business.ownerName && <Text style={styles.ownerName}>{business.ownerName}</Text>}
          </View>
        )}
        {!business.ownerPhotoUrl && !!business.ownerName && (
          <Text style={styles.ownerLine}>Owner: <Text style={styles.ownerLineName}>{business.ownerName}</Text></Text>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default function BusinessHubScreen() {
  const biz = useBusinesses();
  const site = useSiteContent();
  const [selectedId, setSelectedId] = useState(null);

  const selected = selectedId ? (biz.data || []).find(b => b.id === selectedId) : null;

  // Android back button closes the detail view instead of leaving the screen.
  useEffect(() => {
    if (!selected) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelectedId(null);
      return true;
    });
    return () => sub.remove();
  }, [selected]);

  // Business was hidden/deleted while open → fall back to the list.
  useEffect(() => {
    if (selectedId && !biz.loading && !selected) setSelectedId(null);
  }, [selectedId, selected, biz.loading]);

  if (selected) return <BusinessDetail business={selected} onBack={() => setSelectedId(null)} />;

  const list = biz.data || [];
  const refreshing = biz.refreshing || site.refreshing;
  const refresh = () => { biz.refresh && biz.refresh(); site.refresh && site.refresh(); };

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      refreshControl={appRefreshControl(!!refreshing, refresh)}
    >
      <OfflineBanner visible={biz.offline} savedAt={biz.savedAt} />
      <Hero site={site} />

      <View style={styles.body}>
        {biz.loading ? (
          <Loader />
        ) : biz.error && list.length === 0 ? (
          <ErrorState message={biz.error} onRetry={biz.refresh} />
        ) : list.length === 0 ? (
          <View style={styles.pending}>
            <Text style={styles.pendingTx}>Student businesses will appear here soon.</Text>
          </View>
        ) : (
          list.map(b => <BusinessCard key={b.id} business={b} onPress={() => setSelectedId(b.id)} />)
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: COLORS.bg },
  hero:         { width: '100%' },
  heroScrim:    { backgroundColor: 'rgba(28,16,72,0.82)' },
  heroInner:    { paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  heroBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  heroBadgeTx:  { color: COLORS.gold3, fontSize: 10 },
  heroTitle:    { color: COLORS.text, fontSize: 20, fontWeight: '700', lineHeight: 27 },
  heroSub:      { color: COLORS.muted, fontSize: 13, marginTop: 8, lineHeight: 20 },
  body:         { paddingHorizontal: S.lg, paddingTop: S.lg },

  card:         { flexDirection: 'row', gap: S.md, alignItems: 'center', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: S.md, marginBottom: S.md },
  logo:         { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card2 },
  logoFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#5b21b6' },
  logoLetter:   { color: '#fff', fontWeight: '700' },
  name:         { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  desc:         { color: COLORS.muted, fontSize: 12.5, lineHeight: 18, marginTop: 3 },
  more:         { color: COLORS.gold2, fontSize: 11, fontWeight: '600', marginTop: 8 },

  pending:      { borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.border2, borderRadius: RADIUS.md, padding: S.lg },
  pendingTx:    { color: COLORS.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },

  backRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: S.lg, paddingTop: S.lg, paddingBottom: S.md },
  backTx:       { color: COLORS.gold2, fontSize: 13, fontWeight: '600' },
  detailHead:   { flexDirection: 'row', gap: S.lg, alignItems: 'center', paddingHorizontal: S.lg, paddingBottom: S.lg },
  detailEyebrow:{ color: COLORS.dim, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
  detailName:   { color: COLORS.text, fontSize: 21, fontWeight: '800', lineHeight: 27 },
  detailShort:  { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },

  sectionLabel: { color: COLORS.dim, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: S.sm },
  p:            { color: COLORS.muted, fontSize: 13.5, lineHeight: 21, marginBottom: S.lg },

  contactCard:  { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: S.md, marginBottom: S.md },
  contactLine:  { color: COLORS.muted, fontSize: 13, marginBottom: 3 },
  btnRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginTop: S.md },
  btn:          { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: S.lg, paddingVertical: 11, borderRadius: RADIUS.sm },
  btnGold:      { backgroundColor: COLORS.gold2 },
  btnGoldTx:    { color: '#1a1200', fontWeight: '700', fontSize: 13 },
  btnOutline:   { borderWidth: 1, borderColor: COLORS.border2 },
  btnOutlineTx: { color: COLORS.text, fontWeight: '600', fontSize: 13 },

  ownerCard:    { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: S.md, marginBottom: S.md },
  ownerPhoto:   { width: '100%', aspectRatio: 4 / 5, borderRadius: RADIUS.sm, backgroundColor: COLORS.card2 },
  ownerName:    { color: COLORS.text, fontSize: 15, fontWeight: '700', marginTop: S.md },
  ownerLine:    { color: COLORS.muted, fontSize: 13, marginBottom: S.md },
  ownerLineName:{ color: COLORS.text, fontWeight: '700' },
});
