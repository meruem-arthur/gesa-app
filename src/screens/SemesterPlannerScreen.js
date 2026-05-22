import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const S = SPACING;

// ─── UMaT grading ─────────────────────────────────────────────────────────────
function gradeFromMark(m) {
  const n = Number(m);
  if (n >= 80) return 'A';
  if (n >= 70) return 'B';
  if (n >= 60) return 'C';
  if (n >= 50) return 'D';
  return 'F';
}
function gradeColor(g) {
  return { A: '#4ade80', B: '#60a5fa', C: COLORS.gold2, D: '#f59e0b', F: '#f87171' }[g] || COLORS.muted;
}
function degreeClass(cwa) {
  if (cwa >= 80) return { label: 'First Class',        color: '#4ade80' };
  if (cwa >= 70) return { label: 'Second Class Upper', color: '#60a5fa' };
  if (cwa >= 60) return { label: 'Second Class Lower', color: COLORS.gold2 };
  if (cwa >= 50) return { label: 'Third Class',        color: '#f59e0b' };
  return            { label: 'Fail',                  color: '#f87171' };
}

// ─── Required mark formula ────────────────────────────────────────────────────
// targetCWA = (pastWeighted + otherSemWeighted + targetCr * X) / totalCreds
// X = (targetCWA * totalCreds - pastWeighted - otherSemWeighted) / targetCr
function calcRequired({ pastCWA, pastCreds, targetCWA, courses, targetIdx }) {
  const pastW = pastCWA * pastCreds;
  let otherW  = 0;
  let otherCr = 0;
  let targetCr = 0;

  courses.forEach((c, i) => {
    const cr = Number(c.credits);
    const mk = Number(c.mark);
    if (i === targetIdx) {
      targetCr = cr;
    } else if (cr > 0 && c.mark !== '') {
      otherW  += cr * mk;
      otherCr += cr;
    }
  });

  const totalCreds = pastCreds + otherCr + targetCr;
  if (targetCr === 0 || totalCreds === 0) return null;

  const req = (Number(targetCWA) * totalCreds - pastW - otherW) / targetCr;
  return Math.round(req * 10) / 10;
}

function makeCourse() { return { code: '', credits: '', mark: '' }; }

export default function SemesterPlannerScreen() {
  const [pastCWA,   setPastCWA]   = useState('');
  const [pastCreds, setPastCreds] = useState('');
  const [targetCWA, setTargetCWA] = useState('');
  const [courses,   setCourses]   = useState([makeCourse(), makeCourse(), makeCourse()]);

  const addCourse    = () => setCourses(c => [...c, makeCourse()]);
  const removeCourse = i  => setCourses(c => c.length > 1 ? c.filter((_, ci) => ci !== i) : c);
  const updateCourse = useCallback((i, field, val) => {
    setCourses(prev => prev.map((c, ci) => ci === i ? { ...c, [field]: val } : c));
  }, []);

  // ── Live projected CWA ────────────────────────────────────────────────────
  let semW  = 0;
  let semCr = 0;
  courses.forEach(c => {
    const cr = Number(c.credits);
    const mk = Number(c.mark);
    if (cr > 0 && c.mark !== '') { semW += cr * mk; semCr += cr; }
  });

  const totalCreds   = Number(pastCreds) + semCr;
  const totalW       = Number(pastCWA) * Number(pastCreds) + semW;
  const projected    = totalCreds > 0 ? totalW / totalCreds : null;
  const projClass    = projected  !== null ? degreeClass(projected)        : null;
  const targetClass  = targetCWA  ? degreeClass(Number(targetCWA)) : null;

  const ready = pastCWA && pastCreds && targetCWA;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="trending-up-outline" size={11} color={COLORS.gold3} />
          <Text style={styles.badgeTx}>Smart Planner</Text>
        </View>
        <Text style={styles.heroTitle}>Semester Planner</Text>
        <Text style={styles.heroSub}>Set your target CWA — we'll tell you what marks you need</Text>
      </View>

      <View style={styles.body}>

        {/* ── Step 1: Current standing ───────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 1 — Your Current Standing</Text>
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lbl}>Current CWA</Text>
              <TextInput style={styles.inp} value={pastCWA} onChangeText={setPastCWA} placeholder="e.g. 65.4" placeholderTextColor={COLORS.dim} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lbl}>Cumulative Credits</Text>
              <TextInput style={styles.inp} value={pastCreds} onChangeText={setPastCreds} placeholder="e.g. 35" placeholderTextColor={COLORS.dim} keyboardType="numeric" />
            </View>
          </View>
          <Text style={[styles.lbl, { marginTop: S.sm }]}>Target CWA after this semester</Text>
          <TextInput
            style={[styles.inp, { borderColor: targetCWA ? COLORS.gold2 + '88' : COLORS.border }]}
            value={targetCWA} onChangeText={setTargetCWA}
            placeholder="e.g. 70" placeholderTextColor={COLORS.dim} keyboardType="numeric"
          />
          {targetCWA ? (
            <View style={[styles.clsBadge, { backgroundColor: targetClass?.color + '18', borderColor: targetClass?.color + '44' }]}>
              <Text style={[styles.clsTx, { color: targetClass?.color }]}>Target → {targetClass?.label}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Step 2: Courses ───────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Step 2 — This Semester's Courses</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addCourse}>
              <Ionicons name="add" size={14} color="#000" />
              <Text style={styles.addTx}>Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Enter your mark if you know it, or leave blank to see required marks</Text>

          {courses.map((c, i) => {
            const req = ready ? calcRequired({
              pastCWA: Number(pastCWA), pastCreds: Number(pastCreds),
              targetCWA, courses, targetIdx: i,
            }) : null;

            const grade    = c.mark !== '' ? gradeFromMark(c.mark) : null;
            const reqColor = req === null ? COLORS.dim
              : req > 100 ? COLORS.red
              : req >= 80 ? '#4ade80'
              : req >= 60 ? COLORS.gold2
              : '#f59e0b';

            return (
              <View key={i} style={styles.courseRow}>
                <View style={styles.courseInputs}>
                  <TextInput
                    style={styles.codeInp} placeholder="Code" placeholderTextColor={COLORS.dim}
                    value={c.code} onChangeText={v => updateCourse(i, 'code', v)} autoCapitalize="characters"
                  />
                  <TextInput
                    style={styles.crInp} placeholder="Cr" placeholderTextColor={COLORS.dim}
                    value={c.credits} onChangeText={v => updateCourse(i, 'credits', v)} keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.mkInp} placeholder="Mark %" placeholderTextColor={COLORS.dim}
                    value={c.mark} onChangeText={v => updateCourse(i, 'mark', v)} keyboardType="numeric"
                  />
                  {grade && (
                    <View style={[styles.gradeBadge, { borderColor: gradeColor(grade) + '55' }]}>
                      <Text style={[styles.gradeTx, { color: gradeColor(grade) }]}>{grade}</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => removeCourse(i)} style={styles.delBtn}>
                    <Ionicons name="close" size={13} color={COLORS.red} />
                  </TouchableOpacity>
                </View>

                {/* Required mark hint — only show when mark is empty and we have all inputs */}
                {req !== null && c.mark === '' && Number(c.credits) > 0 && (
                  <View style={styles.reqRow}>
                    <Ionicons name="arrow-forward-outline" size={12} color={reqColor} />
                    {req > 100
                      ? <Text style={[styles.reqTx, { color: COLORS.red }]}>Target not achievable for this course alone</Text>
                      : req < 0
                      ? <Text style={[styles.reqTx, { color: '#4ade80' }]}>Any mark will suffice — you're already on track</Text>
                      : <Text style={[styles.reqTx, { color: reqColor }]}>Need at least <Text style={{ fontWeight: '800' }}>{req}%</Text> to reach target CWA</Text>
                    }
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── Projected CWA result ──────────────────────────────────────────── */}
        {projected !== null && (
          <View style={styles.projCard}>
            <Text style={styles.projLbl}>PROJECTED CWA</Text>
            <Text style={[styles.projVal, { color: projClass?.color }]}>{projected.toFixed(2)}</Text>
            <View style={[styles.clsBadge, { backgroundColor: projClass?.color + '22', borderColor: projClass?.color + '44', marginTop: S.sm }]}>
              <Text style={[styles.clsTx, { color: projClass?.color }]}>{projClass?.label}</Text>
            </View>
            {targetCWA && (
              projected >= Number(targetCWA)
                ? <Text style={[styles.gap, { color: '#4ade80' }]}>✓ On track to meet your target!</Text>
                : <Text style={styles.gap}>
                    Need {(Number(targetCWA) - projected).toFixed(2)} more CWA points to hit target
                  </Text>
            )}
          </View>
        )}

        {/* ── Grade scale ───────────────────────────────────────────────────── */}
        <View style={styles.scaleBox}>
          <Text style={styles.scaleTx}>UMaT Scale  ·  A ≥ 80  ·  B ≥ 70  ·  C ≥ 60  ·  D ≥ 50  ·  F &lt; 50</Text>
        </View>

      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: COLORS.bg },
  hero:         { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  badge:        { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  badgeTx:      { color: COLORS.gold3, fontSize: 10 },
  heroTitle:    { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub:      { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  body:         { padding: S.lg },
  card:         { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: S.lg, marginBottom: S.lg },
  cardHead:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.sm },
  cardTitle:    { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: S.sm },
  lbl:          { color: COLORS.muted, fontSize: 11, marginBottom: 4 },
  inp:          { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: S.md, color: COLORS.text, fontSize: 14 },
  row2:         { flexDirection: 'row', gap: S.md },
  clsBadge:     { borderWidth: 1, borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 5, alignSelf: 'flex-start', marginTop: S.sm },
  clsTx:        { fontSize: 12, fontWeight: '700' },
  hint:         { color: COLORS.dim, fontSize: 11, marginBottom: S.md },
  addBtn:       { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.gold2, borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 5 },
  addTx:        { color: '#000', fontSize: 11, fontWeight: '700' },
  courseRow:    { marginBottom: S.md },
  courseInputs: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  codeInp:      { flex: 2, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: S.sm, paddingVertical: 8, color: COLORS.text, fontSize: 12 },
  crInp:        { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: S.sm, paddingVertical: 8, color: COLORS.text, fontSize: 12 },
  mkInp:        { flex: 1.5, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: S.sm, paddingVertical: 8, color: COLORS.text, fontSize: 12 },
  gradeBadge:   { width: 26, height: 26, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  gradeTx:      { fontSize: 10, fontWeight: '700' },
  delBtn:       { padding: 4 },
  reqRow:       { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, paddingLeft: 4 },
  reqTx:        { fontSize: 11 },
  projCard:     { backgroundColor: '#1e1545', borderWidth: 1, borderColor: 'rgba(212,160,23,0.24)', borderRadius: RADIUS.xl, padding: S.xl, alignItems: 'center', marginBottom: S.lg },
  projLbl:      { color: COLORS.muted, fontSize: 10, letterSpacing: 1.5, marginBottom: 4 },
  projVal:      { fontSize: 52, fontWeight: '800', lineHeight: 60 },
  gap:          { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: S.md },
  scaleBox:     { backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: S.md, alignItems: 'center' },
  scaleTx:      { color: COLORS.dim, fontSize: 11 },
});
