import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Loader, ErrorState, EmptyState } from '../components/SharedComponents';

const S = SPACING;

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

function urgency(days) {
  if (days < 0)   return { text: 'Passed',  color: COLORS.dim   };
  if (days === 0) return { text: 'TODAY!',  color: COLORS.red   };
  if (days <= 3)  return { text: 'Urgent',  color: '#f87171'    };
  if (days <= 7)  return { text: 'Soon',    color: '#f59e0b'    };
  return            { text: 'Upcoming', color: COLORS.green  };
}

function Ticker({ examDate, now }) {
  const diff = examDate - now;
  if (diff <= 0) return <Text style={tk.done}>Exam has passed</Text>;

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
  const now = useNow();

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'exams'), orderBy('date', 'asc')));
        setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const upcoming = exams.filter(e => toDate(e.date) >= now);
  const passed   = exams.filter(e => toDate(e.date) < now);

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
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
      {!loading && !error && exams.length === 0 && (
        <EmptyState icon="📅" message="No exams scheduled yet. Check back soon." />
      )}

      {upcoming.length > 0 && (
        <>
          <Text style={styles.sLabel}>UPCOMING</Text>
          {upcoming.map(exam => {
            const d    = toDate(exam.date);
            const days = Math.floor((d - now) / 86400000);
            const urg  = urgency(days);
            return (
              <View key={exam.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.code}>{exam.courseCode}</Text>
                    <Text style={styles.name}>{exam.courseName}</Text>
                  </View>
                  <View style={[styles.urgBadge, { backgroundColor: urg.color + '22', borderColor: urg.color + '55' }]}>
                    <Text style={[styles.urgTx, { color: urg.color }]}>{urg.text}</Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.muted} />
                  <Text style={styles.metaTx}>
                    {d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={12} color={COLORS.muted} />
                  <Text style={styles.metaTx}>
                    {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    {exam.venue ? `  ·  ${exam.venue}` : ''}
                  </Text>
                </View>
                <Ticker examDate={d} now={now} />
              </View>
            );
          })}
        </>
      )}

      {passed.length > 0 && (
        <>
          <Text style={styles.sLabel}>PAST EXAMS</Text>
          {passed.map(exam => (
            <View key={exam.id} style={[styles.card, { opacity: 0.5 }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.code, { color: COLORS.dim }]}>{exam.courseCode}</Text>
                  <Text style={[styles.name, { color: COLORS.dim }]}>{exam.courseName}</Text>
                </View>
                <View style={[styles.urgBadge, { backgroundColor: COLORS.border, borderColor: COLORS.border }]}>
                  <Text style={[styles.urgTx, { color: COLORS.dim }]}>Done</Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={12} color={COLORS.dim} />
                <Text style={[styles.metaTx, { color: COLORS.dim }]}>
                  {toDate(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: COLORS.bg },
  hero:     { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  badge:    { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  badgeTx:  { color: COLORS.gold3, fontSize: 10 },
  title:    { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  sub:      { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  sLabel:   { color: COLORS.dim, fontSize: 10, letterSpacing: 1.5, paddingHorizontal: S.lg, paddingTop: S.lg, paddingBottom: S.sm },
  card:     { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginHorizontal: S.lg, marginBottom: S.md, padding: S.lg },
  cardTop:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: S.sm },
  code:     { color: COLORS.gold3, fontSize: 12, fontWeight: '700' },
  name:     { color: COLORS.text, fontSize: 14, fontWeight: '600', marginTop: 2 },
  urgBadge: { borderWidth: 1, borderRadius: RADIUS.pill, paddingHorizontal: S.sm, paddingVertical: 3 },
  urgTx:    { fontSize: 10, fontWeight: '700' },
  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  metaTx:   { color: COLORS.muted, fontSize: 11 },
});

const tk = StyleSheet.create({
  row:  { flexDirection: 'row', gap: S.sm, marginTop: S.md },
  box:  { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderRadius: RADIUS.sm, alignItems: 'center', paddingVertical: S.sm },
  val:  { fontSize: 22, fontWeight: '800' },
  lbl:  { color: COLORS.dim, fontSize: 9, marginTop: 2 },
  done: { color: COLORS.dim, fontSize: 12, marginTop: S.sm },
});
