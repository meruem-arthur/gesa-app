import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const S = SPACING;
const CATEGORIES = ['All', 'Materials', 'Past Q', 'Lecturers', 'Announcements'];

async function fetchAll() {
  const [mats, pastq, lecs, anns] = await Promise.all([
    getDocs(collection(db, 'learningMaterials')),
    getDocs(collection(db, 'pastQuestions')),
    getDocs(collection(db, 'lecturers')),
    getDocs(collection(db, 'announcements')),
  ]);
  return [
    ...mats.docs.map(d => ({ id: d.id, _type: 'Materials',     ...d.data() })),
    ...pastq.docs.map(d => ({ id: d.id, _type: 'Past Q',        ...d.data() })),
    ...lecs.docs.map(d => ({ id: d.id, _type: 'Lecturers',     ...d.data() })),
    ...anns.docs.map(d => ({ id: d.id, _type: 'Announcements', ...d.data() })),
  ];
}

function matches(item, q) {
  const lower = q.toLowerCase();
  return [item.courseName, item.courseCode, item.name, item.title, item.major, item.body, item.position]
    .filter(Boolean).some(f => f.toLowerCase().includes(lower));
}

const TYPE_META = {
  'Materials':     { icon: 'document-text-outline', color: COLORS.gold2  },
  'Past Q':        { icon: 'reader-outline',         color: COLORS.p300   },
  'Lecturers':     { icon: 'person-outline',         color: '#4ade80'     },
  'Announcements': { icon: 'megaphone-outline',      color: '#60a5fa'     },
};

function ResultCard({ item }) {
  const { icon, color } = TYPE_META[item._type] || {};
  const title = item.courseName || item.name || item.title || '—';
  let sub = '';
  if (item._type === 'Materials')     sub = `${item.courseCode} · Level ${item.level} · Sem ${item.semester}`;
  if (item._type === 'Past Q')        sub = `${item.courseCode} · ${item.year} · Level ${item.level}`;
  if (item._type === 'Lecturers')     sub = [item.title, item.major].filter(Boolean).join(' · ');
  if (item._type === 'Announcements') sub = (item.body || '').slice(0, 60) + '…';

  function handlePress() {
    if ((item._type === 'Materials' || item._type === 'Past Q') && item.fileUrl) {
      WebBrowser.openBrowserAsync(item.fileUrl);
    }
  }

  return (
    <TouchableOpacity style={rc.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={[rc.icon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={rc.title} numberOfLines={1}>{title}</Text>
        <Text style={rc.sub}   numberOfLines={1}>{sub}</Text>
      </View>
      <View style={[rc.badge, { backgroundColor: color + '20' }]}>
        <Text style={[rc.badgeTx, { color }]}>{item._type}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const [all,      setAll]      = useState([]);
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('All');
  const [loading,  setLoading]  = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchAll().then(setAll).finally(() => setLoading(false));
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  const results = all.filter(item => {
    const catOk = category === 'All' || item._type === category;
    const qOk   = query.trim() === '' || matches(item, query);
    return catOk && qOk;
  });

  return (
    <View style={styles.screen}>
      {/* Search bar */}
      <View style={styles.hero}>
        <View style={styles.bar}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} />
          <TextInput
            ref={inputRef}
            style={styles.barInput}
            placeholder="Search courses, lecturers, announcements…"
            placeholderTextColor={COLORS.dim}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.catBar}
        contentContainerStyle={{ paddingHorizontal: S.lg, gap: S.sm, alignItems: 'center' }}
      >
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.cat, category === c && styles.catOn]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.catTx, category === c && styles.catTxOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      {loading
        ? <ActivityIndicator color={COLORS.gold2} style={{ marginTop: 48 }} />
        : (
          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: S.lg, paddingBottom: 40 }}
          >
            {query.trim() === '' && (
              <Text style={styles.hint}>Start typing to search all content</Text>
            )}
            {query.trim() !== '' && results.length === 0 && (
              <Text style={styles.hint}>No results for "{query}"</Text>
            )}
            {results.map(item => (
              <ResultCard key={`${item._type}-${item.id}`} item={item} />
            ))}
          </ScrollView>
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: COLORS.bg },
  hero:     { backgroundColor: '#1c1048', paddingHorizontal: S.lg, paddingTop: S.xl, paddingBottom: S.lg },
  bar:      { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: S.md, paddingVertical: S.sm },
  barInput: { flex: 1, color: COLORS.text, fontSize: 14 },
  catBar:   { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  cat:      { paddingHorizontal: S.md, paddingVertical: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  catOn:    { backgroundColor: COLORS.gold2, borderColor: COLORS.gold2 },
  catTx:    { color: COLORS.muted, fontSize: 12 },
  catTxOn:  { color: '#000', fontWeight: '700' },
  hint:     { color: COLORS.dim, fontSize: 13, textAlign: 'center', marginTop: 40 },
});

const rc = StyleSheet.create({
  card:    { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginBottom: 8, padding: S.md },
  icon:    { width: 36, height: 36, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  title:   { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  sub:     { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  badge:   { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: RADIUS.pill },
  badgeTx: { fontSize: 9, fontWeight: '700' },
});
