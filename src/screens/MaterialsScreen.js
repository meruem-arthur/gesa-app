import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useMaterials } from '../hooks/useFirestore';
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

export default function MaterialsScreen() {
  const [level, setLevel] = useState(100);
  const [sem, setSem] = useState(1);
  const { data, loading, error } = useMaterials(level, sem);

  const openPDF = async (url, name) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="book-outline" size={11} color={COLORS.gold3} />
          <Text style={styles.heroBadgeTx}>Course Resources</Text>
        </View>
        <Text style={styles.heroTitle}>Learning Materials</Text>
        <Text style={styles.heroSub}>Browse by level and semester</Text>
      </View>

      <PillRow options={LEVELS} selected={level} onSelect={setLevel} />
      <TabRow tabs={SEMESTERS} selected={sem} onSelect={setSem} />

      {loading && <Loader />}
      {error && <ErrorState message={error} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState icon="📂" message="No materials uploaded yet for this level and semester." />
      )}

      {data.map((course) => (
        <TouchableOpacity
          key={course.id}
          style={styles.crow}
          onPress={() => openPDF(course.fileUrl, course.courseName)}
          activeOpacity={0.75}
        >
          <View style={styles.cico}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.gold2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ccode}>{course.courseCode}</Text>
            <Text style={styles.cname}>{course.courseName}</Text>
          </View>
          <Ionicons name="download-outline" size={20} color={COLORS.gold2} />
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
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  heroBadgeTx: { color: COLORS.gold3, fontSize: 10 },
  heroTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub: { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  crow: { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginHorizontal: S.lg, marginBottom: 8, padding: S.md },
  cico: { width: 31, height: 31, borderRadius: S.sm, backgroundColor: 'rgba(212,160,23,0.11)', alignItems: 'center', justifyContent: 'center' },
  ccode: { color: COLORS.gold3, fontSize: 11, fontWeight: '600' },
  cname: { color: COLORS.text, fontSize: 12, marginTop: 2 },
});
