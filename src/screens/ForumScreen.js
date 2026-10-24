import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDocs, addDoc, collection, query,
  orderBy, Timestamp, doc, updateDoc, increment,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { addForumReport } from '../hooks/useFirestore';
import { COLORS, RADIUS, SPACING, themed } from '../constants/theme';
import HeroMesh from '../components/HeroMesh';

const S = SPACING;

function timeAgo(val) {
  if (!val) return '';
  const d    = val.toDate ? val.toDate() : new Date(val);
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Report / hide ────────────────────────────────────────────────────────────
// The forum is anonymous, so there are no accounts to block. Instead a student can
// report any post or reply to the admins (who review it in the dashboard) and hide
// it on their own phone straight away. Hidden items are remembered across restarts.
const HIDDEN_KEY = 'gesa_forum_hidden';

function useHiddenContent() {
  const [hidden, setHidden] = useState({});
  useEffect(() => {
    AsyncStorage.getItem(HIDDEN_KEY)
      .then(raw => { if (raw) setHidden(JSON.parse(raw)); })
      .catch(() => {});
  }, []);
  const hide = useCallback((key) => {
    setHidden(prev => {
      const next = { ...prev, [key]: true };
      AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);
  return [hidden, hide];
}

function openReportMenu({ postId, replyId, excerpt, onHide }) {
  Alert.alert(
    replyId ? 'Reply options' : 'Post options',
    'Report anything abusive, hateful, harassing or spam. Admins review every report.',
    [
      {
        text: 'Report to admins',
        style: 'destructive',
        onPress: async () => {
          try {
            await addForumReport({ postId, replyId, excerpt });
            onHide();
            Alert.alert('Thanks', 'Reported. The admins will review it, and it is now hidden for you.');
          } catch {
            Alert.alert('Could not send the report', 'Check your connection and try again.');
          }
        },
      },
      { text: 'Hide for me', onPress: onHide },
      { text: 'Cancel', style: 'cancel' },
    ],
  );
}

const TAGS = ['General', 'Level 100', 'Level 200', 'Level 300', 'Level 400', 'Exams', 'Social'];

// ─── Replies thread ───────────────────────────────────────────────────────────
function ReplyThread({ postId, replyCount: initialCount, hidden, onHide }) {
  const [replies,    setReplies]    = useState([]);
  const [count,      setCount]      = useState(initialCount || 0);
  const [expanded,   setExpanded]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [replyText,  setReplyText]  = useState('');
  const [posting,    setPosting]    = useState(false);

  async function loadReplies() {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'forum', postId, 'replies'), orderBy('createdAt', 'asc'))
      );
      setReplies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  }

  function toggle() {
    if (!expanded) loadReplies();
    setExpanded(v => !v);
  }

  async function submit() {
    if (!replyText.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'forum', postId, 'replies'), {
        body: replyText.trim(),
        createdAt: Timestamp.now(),
      });
      await updateDoc(doc(db, 'forum', postId), { replyCount: increment(1) });
      setCount(c => c + 1);
      setReplyText('');
      await loadReplies();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setPosting(false); }
  }

  return (
    <View>
      <TouchableOpacity style={rp.toggle} onPress={toggle}>
        <Ionicons name="chatbubble-outline" size={13} color={COLORS.muted} />
        <Text style={rp.toggleTx}>
          {count > 0 ? `${count} ${count === 1 ? 'reply' : 'replies'}` : 'Reply'}
          {'  '}{expanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={rp.thread}>
          {loading && <ActivityIndicator color={COLORS.gold2} style={{ margin: S.sm }} />}
          {replies.filter(r => !hidden[`${postId}/${r.id}`]).map(r => (
            <View key={r.id} style={rp.reply}>
              <View style={rp.avatar}><Ionicons name="person-outline" size={11} color={COLORS.dim} /></View>
              <View style={{ flex: 1 }}>
                <Text style={rp.body}>{r.body}</Text>
                <Text style={rp.time}>{timeAgo(r.createdAt)}</Text>
              </View>
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Report or hide this reply"
                onPress={() => openReportMenu({
                  postId, replyId: r.id, excerpt: r.body,
                  onHide: () => onHide(`${postId}/${r.id}`),
                })}
              >
                <Ionicons name="flag-outline" size={13} color={COLORS.dim} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={rp.inputRow}>
            <TextInput
              style={rp.input}
              placeholder="Write a reply…"
              placeholderTextColor={COLORS.dim}
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <TouchableOpacity style={rp.sendBtn} onPress={submit} disabled={posting}>
              {posting
                ? <ActivityIndicator color="#000" size="small" />
                : <Ionicons name="send" size={14} color="#000" />}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Single post card ─────────────────────────────────────────────────────────
function PostCard({ post, onLike, hidden, onHide }) {
  return (
    <View style={pc.card}>
      <View style={pc.top}>
        <View style={pc.avatar}><Ionicons name="person-outline" size={14} color={COLORS.muted} /></View>
        <View style={{ flex: 1 }}>
          <Text style={pc.anon}>Anonymous</Text>
          <Text style={pc.time}>{timeAgo(post.createdAt)}</Text>
        </View>
        <View style={[pc.tagBadge, { backgroundColor: COLORS.p400 + '22' }]}>
          <Text style={[pc.tagTx, { color: COLORS.p300 }]}>{post.tag}</Text>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Report or hide this post"
          onPress={() => openReportMenu({
            postId: post.id, excerpt: post.title,
            onHide: () => onHide(post.id),
          })}
        >
          <Ionicons name="flag-outline" size={15} color={COLORS.dim} />
        </TouchableOpacity>
      </View>
      <Text style={pc.title}>{post.title}</Text>
      {!!post.body && <Text style={pc.body}>{post.body}</Text>}
      <View style={pc.actions}>
        <TouchableOpacity style={pc.likeBtn} onPress={() => onLike(post.id)}>
          <Ionicons name="heart-outline" size={14} color={COLORS.red} />
          <Text style={pc.likeTx}>{post.likes || 0}</Text>
        </TouchableOpacity>
      </View>
      <ReplyThread postId={post.id} replyCount={post.replyCount || 0} hidden={hidden} onHide={onHide} />
    </View>
  );
}

// ─── New post form ────────────────────────────────────────────────────────────
function NewPostForm({ onPosted, onCancel }) {
  const [form,    setForm]    = useState({ title: '', body: '', tag: 'General' });
  const [posting, setPosting] = useState(false);

  async function submit() {
    if (!form.title.trim()) { Alert.alert('Add a title or question'); return; }
    setPosting(true);
    try {
      await addDoc(collection(db, 'forum'), {
        title: form.title.trim(), body: form.body.trim(),
        tag: form.tag, likes: 0, replyCount: 0,
        createdAt: Timestamp.now(),
      });
      onPosted();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setPosting(false); }
  }

  return (
    <View style={nf.box}>
      <Text style={nf.heading}>New Post</Text>
      <TextInput
        style={nf.titleInput}
        placeholder="Title / Question"
        placeholderTextColor={COLORS.dim}
        value={form.title}
        onChangeText={v => setForm(f => ({ ...f, title: v }))}
      />
      <TextInput
        style={nf.bodyInput}
        placeholder="More details (optional)…"
        placeholderTextColor={COLORS.dim}
        value={form.body}
        onChangeText={v => setForm(f => ({ ...f, body: v }))}
        multiline
      />
      <Text style={nf.lbl}>Tag</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.md }}>
        {TAGS.map(t => (
          <TouchableOpacity key={t} style={[nf.chip, form.tag === t && nf.chipOn]} onPress={() => setForm(f => ({ ...f, tag: t }))}>
            <Text style={[nf.chipTx, form.tag === t && nf.chipTxOn]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={nf.btns}>
        <TouchableOpacity style={nf.cancelBtn} onPress={onCancel}>
          <Text style={nf.cancelTx}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={nf.postBtn} onPress={submit} disabled={posting}>
          {posting ? <ActivityIndicator color="#000" /> : <Text style={nf.postTx}>Post</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ForumScreen() {
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  const [hidden,    hide]         = useHiddenContent();

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'forum'), orderBy('createdAt', 'desc')));
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPosts(); }, []);

  async function handleLike(postId) {
    try {
      await updateDoc(doc(db, 'forum', postId), { likes: increment(1) });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
    } catch {
      Alert.alert('Could not save your like', 'Check your connection and try again.');
    }
  }

  const visible  = posts.filter(p => !hidden[p.id]);
  const filtered = activeTag === 'All' ? visible : visible.filter(p => p.tag === activeTag);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={styles.hero}>
<HeroMesh />
          <View style={styles.badge}>
            <Ionicons name="chatbubbles-outline" size={11} color={COLORS.p300} />
            <Text style={styles.badgeTx}>Anonymous · Open to all</Text>
          </View>
          <Text style={styles.heroTitle}>Forum & Q&A</Text>
          <Text style={styles.heroSub}>Ask questions, share ideas, help each other</Text>
        </View>

        {/* Community rules */}
        <View style={styles.rules}>
          <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.p300} style={{ marginTop: 1 }} />
          <Text style={styles.rulesTx}>
            Be respectful. No harassment, hate or spam. Tap the flag on any post or reply to report it
            to the admins, or hide it for yourself.
          </Text>
        </View>

        {/* New post button */}
        {!showForm && (
          <TouchableOpacity style={styles.newBtn} onPress={() => setShowForm(true)}>
            <Ionicons name="create-outline" size={16} color="#000" />
            <Text style={styles.newBtnTx}>Ask a question or start a discussion</Text>
          </TouchableOpacity>
        )}

        {/* New post form */}
        {showForm && (
          <NewPostForm
            onPosted={() => { setShowForm(false); loadPosts(); }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Tag filter */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.tagBar}
          contentContainerStyle={{ paddingHorizontal: S.lg, gap: S.sm, alignItems: 'center' }}
        >
          {['All', ...TAGS].map(t => (
            <TouchableOpacity key={t} style={[styles.tagChip, activeTag === t && styles.tagChipOn]} onPress={() => setActiveTag(t)}>
              <Text style={[styles.tagTx, activeTag === t && styles.tagTxOn]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Posts list */}
        <View style={{ padding: S.lg, paddingBottom: 48 }}>
          {loading && <ActivityIndicator color={COLORS.gold2} style={{ marginTop: 32 }} />}
          {!loading && filtered.length === 0 && (
            <Text style={styles.empty}>No posts yet — be the first to ask!</Text>
          )}
          {filtered.map(post => (
            <PostCard key={post.id} post={post} onLike={handleLike} hidden={hidden} onHide={hide} />
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = themed(() => ({
  screen:      { flex: 1, backgroundColor: COLORS.bg },
  hero:        { backgroundColor: COLORS.hero, ...COLORS.heroShape, paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 1, borderColor: 'rgba(168,85,247,0.35)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  badgeTx:     { color: COLORS.p300, fontSize: 10 },
  heroTitle:   { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub:     { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  newBtn:      { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: COLORS.gold2, marginHorizontal: S.lg, marginTop: S.lg, borderRadius: RADIUS.md, padding: S.md },
  newBtnTx:    { color: '#000', fontWeight: '600', fontSize: 13, flex: 1 },
  tagBar:      { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginTop: S.sm },
  tagChip:     { paddingHorizontal: S.md, paddingVertical: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  tagChipOn:   { backgroundColor: COLORS.p400, borderColor: COLORS.p400 },
  tagTx:       { color: COLORS.muted, fontSize: 11 },
  tagTxOn:     { color: '#fff', fontWeight: '700' },
  empty:       { color: COLORS.dim, fontSize: 13, textAlign: 'center', marginTop: 32 },
  rules:       { flexDirection: 'row', gap: S.sm, marginHorizontal: S.lg, marginTop: S.lg, padding: S.md, borderRadius: RADIUS.md, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  rulesTx:     { flex: 1, color: COLORS.muted, fontSize: 11, lineHeight: 16 },
}));

const pc = themed(() => ({
  card:     { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, marginBottom: S.md, padding: S.lg },
  top:      { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.sm },
  avatar:   { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  anon:     { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  time:     { color: COLORS.dim, fontSize: 10, marginTop: 1 },
  tagBadge: { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: RADIUS.pill },
  tagTx:    { fontSize: 9, fontWeight: '700' },
  title:    { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: S.sm },
  body:     { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginBottom: S.sm },
  actions:  { flexDirection: 'row', marginBottom: S.sm },
  likeBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeTx:   { color: COLORS.red, fontSize: 12 },
}));

const rp = themed(() => ({
  toggle:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: S.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  toggleTx: { color: COLORS.muted, fontSize: 12 },
  thread:   { marginTop: S.sm, paddingLeft: S.md, borderLeftWidth: 2, borderLeftColor: COLORS.border },
  reply:    { flexDirection: 'row', gap: S.sm, marginBottom: S.sm },
  avatar:   { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  body:     { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  time:     { color: COLORS.dim, fontSize: 10, marginTop: 2 },
  inputRow: { flexDirection: 'row', gap: S.sm, marginTop: S.sm, alignItems: 'flex-end' },
  input:    { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: S.sm, color: COLORS.text, fontSize: 13, maxHeight: 80 },
  sendBtn:  { backgroundColor: COLORS.gold2, borderRadius: RADIUS.sm, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
}));

const nf = themed(() => ({
  box:        { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, margin: S.lg, padding: S.lg },
  heading:    { color: COLORS.gold2, fontSize: 12, fontWeight: '700', marginBottom: S.md, textTransform: 'uppercase', letterSpacing: 1 },
  titleInput: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: S.md, color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: S.sm },
  bodyInput:  { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: S.md, color: COLORS.text, fontSize: 13, height: 80, textAlignVertical: 'top', marginBottom: S.sm },
  lbl:        { color: COLORS.muted, fontSize: 11, marginBottom: S.sm },
  chip:       { paddingHorizontal: S.md, paddingVertical: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.border, marginRight: S.sm },
  chipOn:     { backgroundColor: COLORS.p400, borderColor: COLORS.p400 },
  chipTx:     { color: COLORS.muted, fontSize: 11 },
  chipTxOn:   { color: '#fff', fontWeight: '700' },
  btns:       { flexDirection: 'row', gap: S.md, marginTop: S.sm },
  cancelBtn:  { flex: 1, padding: S.md, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelTx:   { color: COLORS.muted, fontSize: 13 },
  postBtn:    { flex: 1, padding: S.md, borderRadius: RADIUS.sm, backgroundColor: COLORS.gold2, alignItems: 'center' },
  postTx:     { color: '#000', fontWeight: '700', fontSize: 13 },
}));
