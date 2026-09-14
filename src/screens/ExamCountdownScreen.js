import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Loader, ErrorState, EmptyState, PillRow } from '../components/SharedComponents';
import { useExamsTimetable } from '../hooks/useFirestore';

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

const LEVELS = [
  { label: 'Level 100', value: 100 },
  { label: 'Level 200', value: 200 },
  { label: 'Level 300', value: 300 },
  { label: 'Level 400', value: 400 },
];

const SESSION_COLOR = { Morning: COLORS.green, Afternoon: '#f59e0b', Evening: COLORS.purple };

function ExamSlotCard({ slot }) {
  const color = SESSION_COLOR[slot.sessionLabel] || COLORS.purple;
  return (
    <View style={ec.card}>
      <View style={ec.top}>
        <Text style={ec.code}>{slot.code}</Text>
        {!!slot.sessionLabel && (
          <View style={[ec.sessionBadge, { backgroundColor: color + '22' }]}>
            <Text style={[ec.sessionText, { color }]}>{slot.sessionLabel}</Text>
          </View>
        )}
      </View>
      {!!slot.name && <Text style={ec.name}>{slot.name}</Text>}
      <View style={ec.metaRow}>
        {!!slot.room && (
          <View style={ec.metaItem}>
            <Ionicons name="location-outline" size={11} color={COLORS.muted} />
            <Text style={ec.metaText}>{slot.room}</Text>
          </View>
        )}
        {!!slot.invigilator && (
          <View style={ec.metaItem}>
            <Ionicons name="person-outline" size={11} color={COLORS.dim} />
            <Text style={ec.metaText}>{slot.invigilator}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ExamDaySection({ dateLabel, slots }) {
  return (
    <View style={eds.container}>
      <Text style={eds.dateLabel}>{dateLabel}</Text>
      {slots.map((slot, i) => <ExamSlotCard key={i} slot={slot} />)}
    </View>
  );
}

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
  const [level, setLevel]     = useState(100);
  const now = useNow();

  const { data: ttSlots, loading: ttLoading } = useExamsTimetable(level);

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

  // Group this level's exam slots by date, in date order
  const ttByDate = [];
  const ttDateIndex = {};
  ttSlots.forEach(slot => {
    const key = toDate(slot.date).toDateString();
    if (ttDateIndex[key] == null) {
      ttDateIndex[key] = ttByDate.length;
      ttByDate.push({ dateLabel: fmtDate(slot.date), slots: [] });
    }
    ttByDate[ttDateIndex[key]].slots.push(slot);
  });

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
          {/* ── 2. Meme of the day ── */}
          <View style={styles.illustrationWrap}>
            <Image
              source={require('../../assets/exam-meme.jpg')}
              style={styles.memeImage}
              resizeMode="contain"
            />
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

          {/* ── 6.5 Exams Timetable, by level ── */}
          <View style={styles.ttSection}>
            <Text style={styles.ttTitle}>Exams Timetable</Text>
            <PillRow options={LEVELS} selected={level} onSelect={setLevel} />

            {ttLoading ? (
              <Loader />
            ) : ttByDate.length === 0 ? (
              <EmptyState icon="🗓️" message="Check back later for the exams timetable." />
            ) : (
              <View style={{ paddingHorizontal: S.lg }}>
                {ttByDate.map((day, i) => (
                  <ExamDaySection key={i} dateLabel={day.dateLabel} slots={day.slots} />
                ))}
              </View>
            )}
          </View>

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
  memeImage:        { width: 260, height: 220, borderRadius: RADIUS.md },
  card:             { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginHorizontal: S.lg, marginBottom: S.md, padding: S.lg },
  examTitle:        { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: S.sm, textAlign: 'center' },
  metaRow:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaTx:           { color: COLORS.muted, fontSize: 12 },
  note:             { color: COLORS.dim, fontSize: 12, marginTop: S.sm, fontStyle: 'italic', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: S.sm },
  ttSection:        { marginTop: S.lg },
  ttTitle:          { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: S.sm, marginHorizontal: S.lg },
  quoteWrap:        { marginHorizontal: S.lg, marginTop: S.md, marginBottom: S.lg, alignItems: 'center', padding: S.lg, backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  quoteTx:          { color: COLORS.muted, fontSize: 12, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
});

const eds = StyleSheet.create({
  container:  { marginBottom: S.md },
  dateLabel:  { color: COLORS.gold3, fontSize: 12, fontWeight: '700', marginBottom: S.sm, marginTop: S.sm },
});

const ec = StyleSheet.create({
  card:         { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: S.md, marginBottom: 8 },
  top:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  code:         { color: COLORS.gold3, fontSize: 13, fontWeight: '800' },
  sessionBadge: { borderRadius: RADIUS.pill, paddingHorizontal: S.sm, paddingVertical: 2 },
  sessionText:  { fontSize: 10, fontWeight: '700' },
  name:         { color: COLORS.text, fontSize: 13, fontWeight: '500', marginBottom: S.sm },
  metaRow:      { flexDirection: 'row', gap: S.lg, flexWrap: 'wrap' },
  metaItem:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:     { color: COLORS.muted, fontSize: 11 },
});

const tk = StyleSheet.create({
  row:  { flexDirection: 'row', gap: S.sm, marginTop: S.md },
  box:  { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderRadius: RADIUS.sm, alignItems: 'center', paddingVertical: S.sm },
  val:  { fontSize: 22, fontWeight: '800' },
  lbl:  { color: COLORS.dim, fontSize: 9, marginTop: 2 },
  done: { color: COLORS.dim, fontSize: 12, marginTop: S.sm, textAlign: 'center' },
});
