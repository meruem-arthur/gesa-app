import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Linking, StyleSheet, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useExecutives, useLecturers } from '../hooks/useFirestore';
import { Loader, ErrorState, EmptyState, GoldBadge, PurpleBadge } from '../components/SharedComponents';

const S = SPACING;

const AVATAR_COLORS = [
  '#5b21b6', '#4c1d95', '#6d28d9', '#3b0764', '#7c3aed', '#5b21b6',
];

// ─── Smart avatar — shows photo if available, initials otherwise ───────────────
function PersonAvatar({ photoUrl, name, bgColor, size = 43 }) {
  const [imgError, setImgError] = useState(false);

  const initials = (name || '')
    .split(' ')
    .filter(w => w.length > 0)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  if (photoUrl && !imgError) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: 'rgba(212,160,23,0.35)',
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <View style={[
      av.circle,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
    ]}>
      <Text style={[av.initials, { fontSize: size * 0.3 }]}>{initials}</Text>
    </View>
  );
}

const av = StyleSheet.create({
  circle:   { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212,160,23,0.2)' },
  initials: { color: '#fff', fontWeight: '700' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function LeadersScreen() {
  const [tab, setTab] = useState('exec');
  const { data: execs,    loading: eLoad, error: eErr } = useExecutives();
  const { data: lecturers, loading: lLoad, error: lErr } = useLecturers();

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="people-outline" size={11} color={COLORS.gold3} />
          <Text style={styles.heroBadgeTx}>2024/25 Executives</Text>
        </View>
        <Text style={styles.heroTitle}>Association Leadership</Text>
        <Text style={styles.heroSub}>Geomatic Engineering Students Association</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'exec' && styles.tabOn]}
          onPress={() => setTab('exec')} activeOpacity={0.7}
        >
          <Text style={[styles.tabTx, tab === 'exec' && styles.tabTxOn]}>Executives</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'lec' && styles.tabOn]}
          onPress={() => setTab('lec')} activeOpacity={0.7}
        >
          <Text style={[styles.tabTx, tab === 'lec' && styles.tabTxOn]}>Lecturers</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 8 }} />

      {/* Executives */}
      {tab === 'exec' && (
        <>
          {eLoad && <Loader />}
          {eErr  && <ErrorState message={eErr} />}
          {!eLoad && !eErr && execs.length === 0 && (
            <EmptyState icon="👥" message="No executives listed yet." />
          )}
          {execs.map((ex, i) => (
            <View key={ex.id} style={styles.lcard}>
              <PersonAvatar
                photoUrl={ex.photoUrl}
                name={ex.name}
                bgColor={AVATAR_COLORS[i % AVATAR_COLORS.length]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.lname}>{ex.name}</Text>
                <Text style={styles.lrole}>{ex.position}</Text>
                {!!ex.phone && (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${ex.phone}`)}>
                    <Text style={styles.phone}>{ex.phone}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <GoldBadge label={ex.position.split(' ')[0]} />
            </View>
          ))}
        </>
      )}

      {/* Lecturers */}
      {tab === 'lec' && (
        <>
          {lLoad && <Loader />}
          {lErr  && <ErrorState message={lErr} />}
          {!lLoad && !lErr && lecturers.length === 0 && (
            <EmptyState icon="👨‍🏫" message="No lecturers listed yet." />
          )}
          {lecturers.map((lec, i) => (
            <View key={lec.id} style={styles.lcard}>
              <PersonAvatar
                photoUrl={lec.photoUrl}
                name={lec.name}
                bgColor={lec.pinnedRole ? '#92400e' : AVATAR_COLORS[i % AVATAR_COLORS.length]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.lname}>{lec.name}</Text>
                <Text style={styles.lrole}>{lec.title} · {lec.major}</Text>
                {!!lec.phone && (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${lec.phone}`)}>
                    <Text style={styles.phone}>{lec.phone}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {lec.pinnedRole === 'HOD'  ? <GoldBadge label="HOD" />
                : lec.pinnedRole === 'Dean' ? <GoldBadge label="Dean" />
                : <PurpleBadge label="Lec" />
              }
            </View>
          ))}
        </>
      )}

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
  tabs:        { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, marginHorizontal: S.lg, marginTop: S.lg },
  tab:         { flex: 1, paddingVertical: S.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn:       { borderBottomColor: COLORS.gold2 },
  tabTx:       { fontSize: 13, color: COLORS.muted },
  tabTxOn:     { color: COLORS.gold2 },
  lcard:       { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginHorizontal: S.lg, marginBottom: 9, padding: S.md },
  lname:       { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  lrole:       { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  phone:       { color: COLORS.gold2, fontSize: 11, marginTop: 3 },
});
