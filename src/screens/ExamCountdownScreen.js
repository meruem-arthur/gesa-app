import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Path, Line, Ellipse } from 'react-native-svg';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Loader, ErrorState, EmptyState } from '../components/SharedComponents';

const S = SPACING;

const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Push yourself because no one else is going to do it for you.",
  "Study hard in silence. Let success make the noise.",
  "Don't watch the clock; do what it does. Keep going.",
  "Your future is created by what you do today, not tomorrow.",
  "The expert in anything was once a beginner.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Believe you can and you're halfway there.",
];

function toDate(val) {
  if (!val) return new Date();
  return val.toDate ? val.toDate() : new Date(val);
}

// Live clock — ticks every second
function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// Simple SVG illustration: person studying at a desk
function StudyingIllustration() {
  return (
    <Svg width={220} height={180} viewBox="0 0 220 180">
      {/* Desk */}
      <Rect x={30} y={120} width={160} height={10} rx={3} fill="#3b2f6e" />
      <Rect x={45} y={130} width={8} height={40} rx={3} fill="#2e2458" />
      <Rect x={167} y={130} width={8} height={40} rx={3} fill="#2e2458" />

      {/* Books stacked on left */}
      <Rect x={38} y={100} width={28} height={20} rx={2} fill="#7c3aed" />
      <Rect x={40} y={96} width={24} height={20} rx={2} fill="#a78bfa" />
      <Rect x={42} y={92} width={20} height={20} rx={2} fill="#6d28d9" />

      {/* Open book / laptop in front of person */}
      <Rect x={90} y={106} width={60} height={14} rx={2} fill="#1e1b4b" />
      <Rect x={92} y={108} width={27} height={10} rx={1} fill="#312e81" />
      <Rect x={121} y={108} width={27} height={10} rx={1} fill="#312e81" />
      {/* book spine */}
      <Rect x={119} y={107} width={2} height={12} rx={1} fill="#4338ca" />

      {/* Body */}
      <Rect x={95} y={68} width={30} height={38} rx={8} fill="#4f46e5" />

      {/* Head */}
      <Circle cx={110} cy={56} r={16} fill="#fcd34d" />
      {/* Hair */}
      <Path d="M94 52 Q110 36 126 52" fill="#1c1048" />
      {/* Eyes */}
      <Circle cx={104} cy={56} r={2} fill="#1c1048" />
      <Circle cx={116} cy={56} r={2} fill="#1c1048" />
      {/* Mouth — small smile */}
      <Path d="M106 63 Q110 67 114 63" stroke="#92400e" strokeWidth={1.5} fill="none" strokeLinecap="round" />

      {/* Left arm reaching to book */}
      <Path d="M96 78 Q78 90 88 112" stroke="#4f46e5" strokeWidth={9} strokeLinecap="round" fill="none" />
      {/* Right arm */}
      <Path d="M124 78 Q138 90 130 112" stroke="#4f46e5" strokeWidth={9} strokeLinecap="round" fill="none" />

      {/* Pencil in right hand */}
      <Rect x={129} y={106} width={4} height={18} rx={1} fill="#fbbf24" transform="rotate(-20 131 115)" />
      <Path d="M127 122 L131 128 L135 122" fill="#f87171" transform="rotate(-20 131 125)" />

      {/* Stars / sparkles top right */}
      <Path d="M170 20 L172 26 L178 24 L172 28 L170 34 L168 28 L162 24 L168 26 Z" fill="#fbbf24" opacity={0.7} />
      <Path d="M190 40 L191 44 L195 42 L191 46 L190 50 L189 46 L185 42 L189 44 Z" fill="#a78bfa" opacity={0.6} />
      <Circle cx={155} cy={35} r={2} fill="#fbbf24" opacity={0.5} />
    </Svg>
  );
}

function Ticker({ examDate, now }) {
  const diff = examDate - now;
  if (diff <= 0) return <Text style={tk.done}>Exam period has begun</Text>;

  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const color = days === 0 ? COLORS.red : days < 7 ? '#f59e0b' : COLORS.green;

  return (
    <View style={tk.row}>
      {[{ v: days, l: 'days' }, { v: hrs, l: 'hrs' }, { v: mins, l: 'mins' }, { v: secs, l: 'secs' }].map(({ v, l }) => (
        <View key={l} style={[tk.box, { borderColor: color + '44' }]}>
          <Text style={[tk.val, { color }]}>{String(v).padStart(2, '0')}</Text>
          <Text style={tk.lbl}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ExamCountdownScreen() {
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [quote]               = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const now = useNow();

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'exams'), orderBy('startDate', 'asc')));
        setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  // Find the next / active exam period
  const nextExam = exams.find(e => toDate(e.startDate) >= now)
    ?? (exams.length > 0 ? exams[exams.length - 1] : null);

  const hasExams = exams.length > 0;

  function fmtDate(val) {
    return toDate(val).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* ── 1. Hero ── */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="alarm-outline" size={11} color={COLORS.gold3} />
          <Text style={styles.badgeTx}>Live Countdown</Text>
        </View>
        <Text style={styles.title}>Exam Countdown</Text>
        <Text style={styles.sub}>Stay ahead — know exactly how long you have</Text>
      </View>

      {loading && <Loader />}
      {error   && <ErrorState message={error} />}

      {!loading && !error && (
        <>
          {/* ── 2. SVG Illustration ── */}
          <View style={styles.illustrationWrap}>
            <StudyingIllustration />
          </View>

          {hasExams && nextExam ? (
            <View style={styles.card}>
              {/* ── 3. Exam title ── */}
              <Text style={styles.examTitle}>{nextExam.title}</Text>

              {/* ── 4. Start date ── */}
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={13} color={COLORS.muted} />
                <Text style={styles.metaTx}>Starts {fmtDate(nextExam.startDate)}</Text>
              </View>

              {/* ── 5. Big countdown ticker ── */}
              <Ticker examDate={toDate(nextExam.startDate)} now={now} />

              {/* ── 6. End date if present ── */}
              {nextExam.endDate && (
                <View style={[styles.metaRow, { marginTop: S.md }]}>
                  <Ionicons name="flag-outline" size={13} color={COLORS.muted} />
                  <Text style={styles.metaTx}>Exams run until {fmtDate(nextExam.endDate)}</Text>
                </View>
              )}

              {/* Note */}
              {!!nextExam.note && (
                <Text style={styles.note}>{nextExam.note}</Text>
              )}
            </View>
          ) : (
            <EmptyState icon="📅" message="No exams scheduled yet. Check back soon." />
          )}

          {/* ── 7. Motivational quote ── */}
          <View style={styles.quoteWrap}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.gold3} style={{ marginBottom: 6 }} />
            <Text style={styles.quoteTx}>"{quote}"</Text>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: COLORS.bg },
  hero:             { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  badge:            { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  badgeTx:          { color: COLORS.gold3, fontSize: 10 },
  title:            { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  sub:              { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  illustrationWrap: { alignItems: 'center', paddingVertical: S.lg },
  card:             { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginHorizontal: S.lg, marginBottom: S.md, padding: S.lg },
  examTitle:        { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: S.sm, textAlign: 'center' },
  metaRow:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaTx:           { color: COLORS.muted, fontSize: 12 },
  note:             { color: COLORS.dim, fontSize: 12, marginTop: S.sm, fontStyle: 'italic', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: S.sm },
  quoteWrap:        { marginHorizontal: S.lg, marginTop: S.md, marginBottom: S.lg, alignItems: 'center', padding: S.lg, backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  quoteTx:          { color: COLORS.muted, fontSize: 12, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
});

const tk = StyleSheet.create({
  row:  { flexDirection: 'row', gap: S.sm, marginTop: S.md },
  box:  { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderRadius: RADIUS.sm, alignItems: 'center', paddingVertical: S.sm },
  val:  { fontSize: 22, fontWeight: '800' },
  lbl:  { color: COLORS.dim, fontSize: 9, marginTop: 2 },
  done: { color: COLORS.dim, fontSize: 12, marginTop: S.sm, textAlign: 'center' },
});
