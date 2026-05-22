import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { usePastQuestions } from '../hooks/useFirestore';
import { Loader, ErrorState, EmptyState, PillRow, TabRow } from '../components/SharedComponents';

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

export default function PastQScreen() {
  const [level, setLevel] = useState(100);
  const [sem, setSem] = useState(1);
  const [year, setYear] = useState(null);
  const { data, loading, error } = usePastQuestions(level, sem);

  // Derive unique years from data
  const years = useMemo(() => {
    const ys = [...new Set(data.map((d) => d.year))].sort((a, b) => b - a);
    if (ys.length > 0 && !year) setYear(ys[0]);
    return ys;
  }, [data]);

  const filtered = year ? data.filter((d) => d.year === year) : data;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroBadgePurple}>
          <Ionicons name="document-outline" size={11} color={COLORS.p300} />
          <Text style={styles.heroBadgePurpleTx}>Exam Prep</Text>
        </View>
        <Text style={styles.heroTitle}>Past Questions</Text>
        <Text style={styles.heroSub}>Filter by level, semester & year</Text>
      </View>

      <PillRow options={LEVELS} selected={level} onSelect={(l) => { setLevel(l); setYear(null); }} />
      <TabRow tabs={SEMESTERS} selected={sem} onSelect={(s) => { setSem(s); setYear(null); }} />

      {/* Year pills */}
      {years.length > 0 && (
        <View style={styles.yearRow}>
          {years.map((y) => (
            <TouchableOpacity
              key={y}
              style={[styles.yrBtn, year === y && styles.yrBtnOn]}
              onPress={() => setYear(y)}
              activeOpacity={0.75}
            >
              <Text style={[styles.yrTx, year === y && styles.yrTxOn]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading && <Loader />}
      {error && <ErrorState message={error} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState icon="📄" message="No past questions uploaded yet for this selection." />
      )}

      {filtered.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.crow}
          onPress={() => WebBrowser.openBrowserAsync(item.fileUrl)}
          activeOpacity={0.75}
        >
          <View style={styles.cico}>
            <Ionicons name="reader-outline" size={15} color={COLORS.p300} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ccode}>{item.courseCode}</Text>
            <Text style={styles.cname}>{item.courseName}</Text>
            <Text style={styles.cmeta}>Level {item.level} · Sem {item.semester} · {item.year}</Text>
          </View>
          <View style={styles.yearBadge}>
            <Text style={styles.yearBadgeTx}>{item.year}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const S = SPACING;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  hero: { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  heroBadgePurple: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 1, borderColor: 'rgba(168,85,247,0.35)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  heroBadgePurpleTx: { color: COLORS.p300, fontSize: 10 },
  heroTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub: { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  yearRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: S.lg, paddingBottom: S.sm, gap: 8 },
  yrBtn: { paddingHorizontal: S.md, paddingVertical: 6, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border },
  yrBtnOn: { backgroundColor: 'rgba(212,160,23,0.14)', borderColor: 'rgba(212,160,23,0.44)' },
  yrTx: { color: COLORS.muted, fontSize: 12 },
  yrTxOn: { color: COLORS.gold3 },
  crow: { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginHorizontal: S.lg, marginBottom: 8, padding: S.md },
  cico: { width: 31, height: 31, borderRadius: S.sm, backgroundColor: 'rgba(168,85,247,0.14)', alignItems: 'center', justifyContent: 'center' },
  ccode: { color: COLORS.gold3, fontSize: 11, fontWeight: '600' },
  cname: { color: COLORS.text, fontSize: 12, marginTop: 2 },
  cmeta: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  yearBadge: { backgroundColor: 'rgba(212,160,23,0.13)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.22)', borderRadius: RADIUS.pill, paddingHorizontal: S.sm, paddingVertical: 3 },
  yearBadgeTx: { color: COLORS.gold3, fontSize: 9 },
});
