import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

// ─── UMaT Grading Scale ───────────────────────────────────────────────────────
// Source: Conduct of Undergraduate Programmes 2022, Section 6.1
const GRADE_SCALE = [
  { min: 80, max: 100, grade: 'A',  label: 'Excellent' },
  { min: 70, max: 79,  grade: 'B',  label: 'Very Good' },
  { min: 60, max: 69,  grade: 'C',  label: 'Good'      },
  { min: 50, max: 59,  grade: 'D',  label: 'Pass'       },
  { min: 0,  max: 49,  grade: 'F',  label: 'Fail'       },
];

function getGrade(mark) {
  const m = Number(mark);
  if (isNaN(m) || m < 0 || m > 100) return null;
  return GRADE_SCALE.find(g => m >= g.min && m <= g.max) || GRADE_SCALE[GRADE_SCALE.length - 1];
}

function getGradeColor(grade) {
  if (!grade) return COLORS.muted;
  switch (grade.grade) {
    case 'A': return '#4ade80';
    case 'B': return '#60a5fa';
    case 'C': return COLORS.gold2;
    case 'D': return '#f59e0b';
    case 'F': return '#f87171';
    default:  return COLORS.muted;
  }
}

function getCWAClass(cwa) {
  if (cwa >= 80) return { label: 'First Class',        color: '#4ade80' };
  if (cwa >= 70) return { label: 'Second Class Upper', color: '#60a5fa' };
  if (cwa >= 60) return { label: 'Second Class Lower', color: COLORS.gold2 };
  if (cwa >= 50) return { label: 'Third Class',        color: '#f59e0b' };
  return            { label: 'Fail',                  color: '#f87171' };
}

const S = SPACING;

// ─── Semester block ───────────────────────────────────────────────────────────
function SemesterBlock({ semIndex, semData, onChange, onAddCourse, onRemoveCourse }) {
  const label = `Semester ${semIndex + 1}`;

  return (
    <View style={blk.box}>
      <View style={blk.header}>
        <View style={blk.headerLeft}>
          <Text style={blk.headerTx}>{label}</Text>
          {semData.swa !== null && (
            <Text style={[blk.swa, { color: getGradeColor(getGrade(semData.swa)) }]}>
              SWA: {semData.swa.toFixed(2)}
            </Text>
          )}
        </View>
        <TouchableOpacity style={blk.addBtn} onPress={onAddCourse}>
          <Ionicons name="add" size={14} color="#000" />
          <Text style={blk.addTx}>Course</Text>
        </TouchableOpacity>
      </View>

      {semData.courses.map((course, ci) => (
        <View key={ci} style={blk.row}>
          <TextInput
            style={[blk.inp, { flex: 2 }]}
            placeholder="Code"
            placeholderTextColor={COLORS.dim}
            value={course.code}
            onChangeText={v => onChange(ci, 'code', v)}
            autoCapitalize="characters"
          />
          <TextInput
            style={[blk.inp, { flex: 1 }]}
            placeholder="Cr"
            placeholderTextColor={COLORS.dim}
            value={course.credits}
            onChangeText={v => onChange(ci, 'credits', v)}
            keyboardType="numeric"
          />
          <TextInput
            style={[blk.inp, { flex: 1.5 }]}
            placeholder="Mark %"
            placeholderTextColor={COLORS.dim}
            value={course.mark}
            onChangeText={v => onChange(ci, 'mark', v)}
            keyboardType="numeric"
          />
          {/* Grade badge */}
          <View style={[blk.gradeBadge, { borderColor: getGradeColor(getGrade(course.mark)) + '55' }]}>
            <Text style={[blk.gradeTx, { color: getGradeColor(getGrade(course.mark)) }]}>
              {course.mark ? (getGrade(course.mark)?.grade || '–') : '–'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onRemoveCourse(ci)} style={blk.delBtn}>
            <Ionicons name="close" size={14} color={COLORS.red} />
          </TouchableOpacity>
        </View>
      ))}

      {semData.courses.length === 0 && (
        <Text style={blk.empty}>Tap "+ Course" to add courses</Text>
      )}

      {/* Semester summary */}
      {semData.courses.some(c => c.credits && c.mark) && (
        <View style={blk.sumRow}>
          <Text style={blk.sumTx}>Credits: {semData.totalCredits}</Text>
          <Text style={blk.sumTx}>Weighted: {semData.totalWeighted}</Text>
          <Text style={[blk.sumTx, { color: COLORS.gold2, fontWeight: '700' }]}>
            SWA: {semData.swa?.toFixed(2) ?? '–'}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
function makeCourse() { return { code: '', credits: '', mark: '' }; }
function makeSem()    { return { courses: [makeCourse()], swa: null, totalCredits: 0, totalWeighted: 0 }; }

function computeSem(sem) {
  let totalCredits = 0;
  let totalWeighted = 0;
  sem.courses.forEach(c => {
    const cr = Number(c.credits);
    const mk = Number(c.mark);
    if (cr > 0 && mk >= 0 && mk <= 100 && c.credits && c.mark) {
      totalCredits  += cr;
      totalWeighted += cr * mk;
    }
  });
  return {
    ...sem,
    totalCredits,
    totalWeighted,
    swa: totalCredits > 0 ? totalWeighted / totalCredits : null,
  };
}

export default function CWAScreen() {
  const [semesters, setSemesters] = useState([makeSem()]);
  const [showScale, setShowScale] = useState(false);

  // ── Mutators ────────────────────────────────────────────────────────────────
  const updateCourse = useCallback((semIdx, courseIdx, field, value) => {
    setSemesters(prev => {
      const next = prev.map((s, si) => {
        if (si !== semIdx) return s;
        const courses = s.courses.map((c, ci) =>
          ci === courseIdx ? { ...c, [field]: value } : c
        );
        return computeSem({ ...s, courses });
      });
      return next;
    });
  }, []);

  const addCourse = useCallback((semIdx) => {
    setSemesters(prev => prev.map((s, si) =>
      si !== semIdx ? s : computeSem({ ...s, courses: [...s.courses, makeCourse()] })
    ));
  }, []);

  const removeCourse = useCallback((semIdx, courseIdx) => {
    setSemesters(prev => prev.map((s, si) => {
      if (si !== semIdx) return s;
      const courses = s.courses.filter((_, ci) => ci !== courseIdx);
      return computeSem({ ...s, courses: courses.length ? courses : [makeCourse()] });
    }));
  }, []);

  const addSemester = () => {
    if (semesters.length >= 8) { Alert.alert('Max 8 semesters (4 years)'); return; }
    setSemesters(prev => [...prev, makeSem()]);
  };

  const removeSemester = () => {
    if (semesters.length <= 1) return;
    setSemesters(prev => prev.slice(0, -1));
  };

  const resetAll = () => {
    Alert.alert('Reset Calculator', 'Clear all semesters?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => setSemesters([makeSem()]) },
    ]);
  };

  // ── CWA computation ─────────────────────────────────────────────────────────
  let cumWeighted = 0;
  let cumCredits  = 0;
  semesters.forEach(s => {
    cumWeighted += s.totalWeighted;
    cumCredits  += s.totalCredits;
  });
  const cwa = cumCredits > 0 ? cumWeighted / cumCredits : null;
  const cls = cwa !== null ? getCWAClass(cwa) : null;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="calculator-outline" size={11} color={COLORS.gold3} />
          <Text style={styles.heroBadgeTx}>UMaT Grading System</Text>
        </View>
        <Text style={styles.heroTitle}>CWA Calculator</Text>
        <Text style={styles.heroSub}>Cumulative Weighted Average · Geomatic Engineering</Text>
      </View>

      {/* CWA result card */}
      {cwa !== null && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLbl}>Your CWA</Text>
          <Text style={[styles.resultCWA, { color: cls?.color }]}>{cwa.toFixed(2)}</Text>
          <View style={[styles.clsBadge, { backgroundColor: cls?.color + '22', borderColor: cls?.color + '55' }]}>
            <Text style={[styles.clsTx, { color: cls?.color }]}>{cls?.label}</Text>
          </View>
          <View style={styles.resultMeta}>
            <View style={styles.metaChip}>
              <Text style={styles.metaLbl}>Total Credits</Text>
              <Text style={styles.metaVal}>{cumCredits}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaLbl}>Weighted Marks</Text>
              <Text style={styles.metaVal}>{cumWeighted.toFixed(0)}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaLbl}>Semesters</Text>
              <Text style={styles.metaVal}>{semesters.length}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Grading scale toggle */}
      <TouchableOpacity style={styles.scaleTog} onPress={() => setShowScale(v => !v)}>
        <Ionicons name="information-circle-outline" size={14} color={COLORS.muted} />
        <Text style={styles.scaleTogTx}>UMaT Grading Scale</Text>
        <Ionicons name={showScale ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.muted} />
      </TouchableOpacity>

      {showScale && (
        <View style={styles.scaleBox}>
          {GRADE_SCALE.map(g => (
            <View key={g.grade} style={styles.scaleRow}>
              <Text style={[styles.scaleGrade, { color: getGradeColor(g) }]}>{g.grade}</Text>
              <Text style={styles.scaleRange}>{g.min} – {g.max}%</Text>
              <Text style={styles.scaleLabel}>{g.label}</Text>
            </View>
          ))}
          <View style={styles.scaleDivider} />
          <Text style={styles.scaleNote}>CWA = Cumulative Weighted Marks ÷ Cumulative Credits</Text>
          <Text style={styles.scaleNote}>Weighted Mark = Credits × Mark (%)</Text>
        </View>
      )}

      {/* Semester blocks */}
      <View style={{ paddingHorizontal: S.lg }}>
        {semesters.map((sem, si) => (
          <SemesterBlock
            key={si}
            semIndex={si}
            semData={sem}
            onChange={(ci, field, val) => updateCourse(si, ci, field, val)}
            onAddCourse={() => addCourse(si)}
            onRemoveCourse={ci => removeCourse(si, ci)}
          />
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.addSemBtn} onPress={addSemester}>
          <Ionicons name="add-circle-outline" size={16} color={COLORS.gold2} />
          <Text style={styles.addSemTx}>Add Semester</Text>
        </TouchableOpacity>
        {semesters.length > 1 && (
          <TouchableOpacity style={styles.remSemBtn} onPress={removeSemester}>
            <Ionicons name="remove-circle-outline" size={16} color={COLORS.red} />
            <Text style={styles.remSemTx}>Remove Last</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={resetAll}>
        <Ionicons name="refresh-outline" size={14} color={COLORS.muted} />
        <Text style={styles.resetTx}>Reset All</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: COLORS.bg },
  hero:        { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  heroBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  heroBadgeTx: { color: COLORS.gold3, fontSize: 10 },
  heroTitle:   { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub:     { color: COLORS.muted, fontSize: 12, marginTop: 5 },

  resultCard:  { backgroundColor: '#1e1545', borderWidth: 1, borderColor: 'rgba(212,160,23,0.24)', borderRadius: RADIUS.xl, marginHorizontal: S.lg, marginTop: S.lg, padding: S.xl, alignItems: 'center' },
  resultLbl:   { color: COLORS.muted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  resultCWA:   { fontSize: 52, fontWeight: '800', lineHeight: 60 },
  clsBadge:    { borderWidth: 1, borderRadius: RADIUS.pill, paddingHorizontal: S.lg, paddingVertical: 5, marginTop: S.sm },
  clsTx:       { fontSize: 13, fontWeight: '700' },
  resultMeta:  { flexDirection: 'row', gap: S.md, marginTop: S.lg },
  metaChip:    { flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: S.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  metaLbl:     { color: COLORS.muted, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaVal:     { color: COLORS.text, fontSize: 15, fontWeight: '700', marginTop: 2 },

  scaleTog:    { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginHorizontal: S.lg, marginTop: S.lg, paddingVertical: S.sm },
  scaleTogTx:  { color: COLORS.muted, fontSize: 12, flex: 1 },
  scaleBox:    { backgroundColor: COLORS.card, borderRadius: RADIUS.md, marginHorizontal: S.lg, padding: S.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: S.sm },
  scaleRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: S.md },
  scaleGrade:  { fontSize: 14, fontWeight: '700', width: 24 },
  scaleRange:  { color: COLORS.muted, fontSize: 12, flex: 1 },
  scaleLabel:  { color: COLORS.dim, fontSize: 11 },
  scaleDivider:{ height: 1, backgroundColor: COLORS.border, marginVertical: S.sm },
  scaleNote:   { color: COLORS.dim, fontSize: 11, marginTop: 3 },

  actions:     { flexDirection: 'row', gap: S.md, marginHorizontal: S.lg, marginTop: S.md },
  addSemBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, backgroundColor: 'rgba(212,160,23,0.1)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.3)', borderRadius: RADIUS.md, paddingVertical: S.md },
  addSemTx:    { color: COLORS.gold2, fontSize: 13, fontWeight: '600' },
  remSemBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, backgroundColor: 'rgba(248,113,113,0.08)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', borderRadius: RADIUS.md, paddingVertical: S.md },
  remSemTx:    { color: COLORS.red, fontSize: 13, fontWeight: '600' },
  resetBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, marginTop: S.md, paddingVertical: S.sm },
  resetTx:     { color: COLORS.dim, fontSize: 12 },
});

const blk = StyleSheet.create({
  box:       { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: S.md, overflow: 'hidden' },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerLeft:{ flexDirection: 'row', alignItems: 'center', gap: S.md },
  headerTx:  { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  swa:       { fontSize: 12, fontWeight: '600' },
  addBtn:    { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.gold2, borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 5 },
  addTx:     { color: '#000', fontSize: 11, fontWeight: '700' },
  row:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: S.md, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border + '88' },
  inp:       { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: S.sm, paddingVertical: 7, color: COLORS.text, fontSize: 12 },
  gradeBadge:{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  gradeTx:   { fontSize: 11, fontWeight: '700' },
  delBtn:    { padding: 4 },
  empty:     { color: COLORS.dim, fontSize: 12, textAlign: 'center', padding: S.lg },
  sumRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: S.md, paddingVertical: S.sm, backgroundColor: COLORS.surface },
  sumTx:     { color: COLORS.muted, fontSize: 11 },
});
