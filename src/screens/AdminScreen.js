import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Switch, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { uploadPhoto, uploadFile } from '../../cloudinary';
import {
  addExecutive, updateExecutive, deleteExecutive,
  addLecturer, updateLecturer, deleteLecturer,
  addEvent, deleteEvent,
  addAnnouncement, deleteAnnouncement,
  addWordOfDay, deleteWordOfDay, getAllWordsOfDay,
  addMaterial, deleteMaterial, getAllMaterials,
  addPastQuestion, deletePastQuestion, getAllPastQuestions,
  addExam, deleteExam, getAllExams,
  addTutorial, deleteTutorial, getAllTutorials,
  getAllPushTokens,
} from '../hooks/useFirestore';
import { db } from '../../firebase';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';

const S = SPACING;

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, multiline, keyboardType }) {
  return (
    <View style={{ marginBottom: S.sm }}>
      <Text style={fi.label}>{label}</Text>
      <TextInput
        style={[fi.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value} onChangeText={onChangeText}
        placeholder={placeholder || label} placeholderTextColor={COLORS.dim}
        multiline={multiline} keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

function SectionHeader({ title, icon, onAdd }) {
  return (
    <View style={sh.row}>
      <Ionicons name={icon} size={16} color={COLORS.gold2} />
      <Text style={sh.title}>{title}</Text>
      {!!onAdd && (
        <TouchableOpacity style={sh.addBtn} onPress={onAdd}>
          <Ionicons name="add" size={16} color="#000" />
          <Text style={sh.addTx}>Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ItemRow({ name, sub, onEdit, onDelete }) {
  return (
    <View style={ir.row}>
      <View style={{ flex: 1 }}>
        <Text style={ir.name}>{name}</Text>
        {!!sub && <Text style={ir.sub}>{sub}</Text>}
      </View>
      {!!onEdit && (
        <TouchableOpacity style={ir.editBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={13} color={COLORS.gold2} />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={ir.delBtn} onPress={onDelete}>
        <Ionicons name="trash-outline" size={13} color={COLORS.red} />
      </TouchableOpacity>
    </View>
  );
}

function PhotoPicker({ uri, onPick }) {
  return (
    <TouchableOpacity style={sec.photoPick} onPress={onPick}>
      {uri
        ? <Image source={{ uri }} style={sec.photoPreview} />
        : <><Ionicons name="camera-outline" size={18} color={COLORS.muted} /><Text style={sec.photoTx}>Pick Photo (optional)</Text></>
      }
    </TouchableOpacity>
  );
}

function FormBtns({ onCancel, onSave, saving, saveLabel }) {
  return (
    <View style={sec.formBtns}>
      <TouchableOpacity style={sec.cancelBtn} onPress={onCancel}>
        <Text style={sec.cancelTx}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={sec.saveBtn} onPress={onSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#000" /> : <Text style={sec.saveTx}>{saveLabel || 'Save'}</Text>}
      </TouchableOpacity>
    </View>
  );
}

// ─── EXECUTIVES ───────────────────────────────────────────────────────────────
function ExecutivesSection() {
  const [list, setList]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]           = useState({ name: '', position: '', order: '' });
  const [photoUri, setPhotoUri]   = useState(null);
  const [saving, setSaving]       = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'executives'), orderBy('order', 'asc')));
      setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, []);

  function openAdd()  { setEditTarget(null); setForm({ name: '', position: '', order: '' }); setPhotoUri(null); setShowForm(true); }
  function openEdit(ex) { setEditTarget(ex); setForm({ name: ex.name, position: ex.position, order: String(ex.order || '') }); setPhotoUri(null); setShowForm(true); }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled) setPhotoUri(r.assets[0].uri);
  }

  async function handleSave() {
    if (!form.name || !form.position) { Alert.alert('Fill name and position'); return; }
    setSaving(true);
    try {
      let photoUrl = editTarget?.photoUrl || '';
      if (photoUri) photoUrl = await uploadPhoto(photoUri, 'gesa/photos/executives');
      editTarget
        ? await updateExecutive(editTarget.id, { name: form.name, position: form.position, order: Number(form.order) || 99, photoUrl })
        : await addExecutive({ ...form, photoUrl });
      await refresh(); setShowForm(false);
      Alert.alert(editTarget ? '✅ Updated!' : '✅ Added!');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete Executive', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteExecutive(id); await refresh(); } },
    ]);
  }

  return (
    <View style={sec.box}>
      <SectionHeader title="Executives" icon="ribbon-outline" onAdd={openAdd} />
      {showForm && (
        <View style={sec.form}>
          <Text style={sec.formTitle}>{editTarget ? 'Edit Executive' : 'New Executive'}</Text>
          <Field label="Full Name" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="Position" value={form.position} onChangeText={v => setForm(f => ({ ...f, position: v }))} />
          <Field label="Order (1 = President)" value={form.order} onChangeText={v => setForm(f => ({ ...f, order: v }))} keyboardType="numeric" />
          <PhotoPicker uri={photoUri} onPick={pickPhoto} />
          {editTarget && !photoUri && <Text style={sec.photoNote}>Leave empty to keep existing photo</Text>}
          <FormBtns onCancel={() => setShowForm(false)} onSave={handleSave} saving={saving} saveLabel={editTarget ? 'Update' : 'Save'} />
        </View>
      )}
      {loading ? <ActivityIndicator color={COLORS.gold2} style={{ margin: S.md }} />
        : list.map(ex => <ItemRow key={ex.id} name={ex.name} sub={ex.position} onEdit={() => openEdit(ex)} onDelete={() => handleDelete(ex.id)} />)}
    </View>
  );
}

// ─── LECTURERS ────────────────────────────────────────────────────────────────
function LecturersSection() {
  const [list, setList]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]           = useState({ name: '', title: '', major: '', phone: '', email: '', isPinned: false });
  const [photoUri, setPhotoUri]   = useState(null);
  const [saving, setSaving]       = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'lecturers'));
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => { if (a.isPinned && !b.isPinned) return -1; if (!a.isPinned && b.isPinned) return 1; return a.name.localeCompare(b.name); });
      setList(docs);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, []);

  function openAdd()   { setEditTarget(null); setForm({ name: '', title: '', major: '', phone: '', email: '', isPinned: false }); setPhotoUri(null); setShowForm(true); }
  function openEdit(l) { setEditTarget(l); setForm({ name: l.name, title: l.title || '', major: l.major || '', phone: l.phone || '', email: l.email || '', isPinned: l.isPinned || false }); setPhotoUri(null); setShowForm(true); }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled) setPhotoUri(r.assets[0].uri);
  }

  async function handleSave() {
    if (!form.name || !form.title) { Alert.alert('Fill name and title'); return; }
    setSaving(true);
    try {
      let photoUrl = editTarget?.photoUrl || '';
      if (photoUri) photoUrl = await uploadPhoto(photoUri, 'gesa/photos/lecturers');
      editTarget ? await updateLecturer(editTarget.id, { ...form, photoUrl }) : await addLecturer({ ...form, photoUrl });
      await refresh(); setShowForm(false);
      Alert.alert(editTarget ? '✅ Updated!' : '✅ Added!');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete Lecturer', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteLecturer(id); await refresh(); } },
    ]);
  }

  return (
    <View style={sec.box}>
      <SectionHeader title="Lecturers" icon="school-outline" onAdd={openAdd} />
      {showForm && (
        <View style={sec.form}>
          <Text style={sec.formTitle}>{editTarget ? 'Edit Lecturer' : 'New Lecturer'}</Text>
          <Field label="Full Name" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="Title (e.g. Dr., Prof.)" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
          <Field label="Major / Specialisation" value={form.major} onChangeText={v => setForm(f => ({ ...f, major: v }))} />
          <Field label="Phone" value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />
          <Field label="Email" value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} keyboardType="email-address" />
          <View style={sec.switchRow}>
            <Text style={fi.label}>Pin as HOD / Dean?</Text>
            <Switch value={form.isPinned} onValueChange={v => setForm(f => ({ ...f, isPinned: v }))} trackColor={{ true: COLORS.gold2 }} />
          </View>
          <PhotoPicker uri={photoUri} onPick={pickPhoto} />
          {editTarget && !photoUri && <Text style={sec.photoNote}>Leave empty to keep existing photo</Text>}
          <FormBtns onCancel={() => setShowForm(false)} onSave={handleSave} saving={saving} saveLabel={editTarget ? 'Update' : 'Save'} />
        </View>
      )}
      {loading ? <ActivityIndicator color={COLORS.gold2} style={{ margin: S.md }} />
        : list.map(l => <ItemRow key={l.id} name={l.name} sub={`${l.title} · ${l.major}`} onEdit={() => openEdit(l)} onDelete={() => handleDelete(l.id)} />)}
    </View>
  );
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
const EVENT_TAGS = ['General', 'Academic', 'Formal', 'Social', 'Trip'];

function EventsSection() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', description: '', date: '', location: '', tag: 'General', featured: false });
  const [saving, setSaving]     = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')));
      setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, []);

  async function handleSave() {
    if (!form.title || !form.date) { Alert.alert('Fill title and date'); return; }
    setSaving(true);
    try {
      await addEvent(form); await refresh();
      setForm({ title: '', description: '', date: '', location: '', tag: 'General', featured: false }); setShowForm(false);
      Alert.alert('✅ Event added!');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteEvent(id); await refresh(); } },
    ]);
  }

  return (
    <View style={sec.box}>
      <SectionHeader title="Events" icon="calendar-outline" onAdd={() => setShowForm(v => !v)} />
      {showForm && (
        <View style={sec.form}>
          <Field label="Title" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
          <Field label="Description" value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
          <Field label="Date" value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} placeholder="e.g. 2025-06-01T10:00:00Z" />
          <Field label="Location" value={form.location} onChangeText={v => setForm(f => ({ ...f, location: v }))} />
          <Text style={fi.label}>Tag</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.sm }}>
            {EVENT_TAGS.map(t => (
              <TouchableOpacity key={t} style={[sec.chip, form.tag === t && sec.chipOn]} onPress={() => setForm(f => ({ ...f, tag: t }))}>
                <Text style={[sec.chipTx, form.tag === t && sec.chipTxOn]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={sec.switchRow}>
            <Text style={fi.label}>Featured?</Text>
            <Switch value={form.featured} onValueChange={v => setForm(f => ({ ...f, featured: v }))} trackColor={{ true: COLORS.gold2 }} />
          </View>
          <FormBtns onCancel={() => setShowForm(false)} onSave={handleSave} saving={saving} />
        </View>
      )}
      {loading ? <ActivityIndicator color={COLORS.gold2} style={{ margin: S.md }} />
        : list.map(ev => {
          const d = ev.date?.toDate ? ev.date.toDate() : new Date(ev.date);
          return <ItemRow key={ev.id} name={ev.title} sub={`${d.toDateString()} · ${ev.location}`} onDelete={() => handleDelete(ev.id)} />;
        })}
    </View>
  );
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
const ANN_TAGS   = ['Academic', 'Finance', 'Trip', 'Resources', 'Event', 'General'];
const ANN_COLORS = ['purple', 'gold', 'amber', 'blue', 'green'];

function AnnouncementsSection() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', body: '', tag: 'General', color: 'purple', author: '' });
  const [saving, setSaving]     = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
      setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, []);

  async function handleSave() {
    if (!form.title || !form.body) { Alert.alert('Fill title and body'); return; }
    setSaving(true);
    try {
      await addAnnouncement(form); await refresh();
      setForm({ title: '', body: '', tag: 'General', color: 'purple', author: '' }); setShowForm(false);
      Alert.alert('✅ Announcement posted!');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete Announcement', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteAnnouncement(id); await refresh(); } },
    ]);
  }

  return (
    <View style={sec.box}>
      <SectionHeader title="Announcements" icon="megaphone-outline" onAdd={() => setShowForm(v => !v)} />
      {showForm && (
        <View style={sec.form}>
          <Field label="Title" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
          <Field label="Body" value={form.body} onChangeText={v => setForm(f => ({ ...f, body: v }))} multiline />
          <Field label="Author" value={form.author} onChangeText={v => setForm(f => ({ ...f, author: v }))} placeholder="e.g. GESA President" />
          <Text style={fi.label}>Tag</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.sm }}>
            {ANN_TAGS.map(t => (
              <TouchableOpacity key={t} style={[sec.chip, form.tag === t && sec.chipOn]} onPress={() => setForm(f => ({ ...f, tag: t }))}>
                <Text style={[sec.chipTx, form.tag === t && sec.chipTxOn]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={fi.label}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.sm }}>
            {ANN_COLORS.map(c => (
              <TouchableOpacity key={c} style={[sec.chip, form.color === c && sec.chipOn]} onPress={() => setForm(f => ({ ...f, color: c }))}>
                <Text style={[sec.chipTx, form.color === c && sec.chipTxOn]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <FormBtns onCancel={() => setShowForm(false)} onSave={handleSave} saving={saving} saveLabel="Post" />
        </View>
      )}
      {loading ? <ActivityIndicator color={COLORS.gold2} style={{ margin: S.md }} />
        : list.map(a => <ItemRow key={a.id} name={a.title} sub={`${a.tag} · ${a.author}`} onDelete={() => handleDelete(a.id)} />)}
    </View>
  );
}

// ─── WORD OF THE DAY ──────────────────────────────────────────────────────────
function WordOfDaySection() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ word: '', type: '', definition: '', example: '', date: '' });
  const [saving, setSaving]     = useState(false);

  const refresh = async () => { setLoading(true); try { setList(await getAllWordsOfDay()); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);

  async function handleSave() {
    if (!form.word || !form.definition || !form.date) { Alert.alert('Fill word, definition and date'); return; }
    setSaving(true);
    try { await addWordOfDay(form); await refresh(); setForm({ word: '', type: '', definition: '', example: '', date: '' }); setShowForm(false); Alert.alert('✅ Word added!'); }
    catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete Word', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteWordOfDay(id); await refresh(); } },
    ]);
  }

  return (
    <View style={sec.box}>
      <SectionHeader title="Word of the Day" icon="text-outline" onAdd={() => setShowForm(v => !v)} />
      {showForm && (
        <View style={sec.form}>
          <Field label="Word" value={form.word} onChangeText={v => setForm(f => ({ ...f, word: v }))} />
          <Field label="Type (e.g. noun · Geomatics)" value={form.type} onChangeText={v => setForm(f => ({ ...f, type: v }))} />
          <Field label="Definition" value={form.definition} onChangeText={v => setForm(f => ({ ...f, definition: v }))} multiline />
          <Field label="Example sentence" value={form.example} onChangeText={v => setForm(f => ({ ...f, example: v }))} multiline />
          <Field label="Date (YYYY-MM-DD)" value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} placeholder="e.g. 2025-06-01" />
          <FormBtns onCancel={() => setShowForm(false)} onSave={handleSave} saving={saving} />
        </View>
      )}
      {loading ? <ActivityIndicator color={COLORS.gold2} style={{ margin: S.md }} />
        : list.map(w => <ItemRow key={w.id} name={w.word} sub={`${w.type} · ${w.date}`} onDelete={() => handleDelete(w.id)} />)}
    </View>
  );
}

// ─── MATERIALS ────────────────────────────────────────────────────────────────
function MaterialsSection() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ level: '', semester: '', courseCode: '', courseName: '' });
  const [fileUri, setFileUri]   = useState(null);
  const [fileName, setFileName] = useState('');
  const [saving, setSaving]     = useState(false);

  const refresh = async () => { setLoading(true); try { setList(await getAllMaterials()); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);

  async function pickFile() {
    const r = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!r.canceled && r.assets?.length > 0) { setFileUri(r.assets[0].uri); setFileName(r.assets[0].name); }
  }

  async function handleSave() {
    if (!form.level || !form.courseCode || !fileUri) { Alert.alert('Pick a level, course code and PDF'); return; }
    setSaving(true);
    try {
      const fileUrl = await uploadFile(fileUri, `gesa/materials/level${form.level}/sem${form.semester}`);
      await addMaterial({ ...form, fileUrl }); await refresh();
      setForm({ level: '', semester: '', courseCode: '', courseName: '' }); setFileUri(null); setFileName(''); setShowForm(false);
      Alert.alert('✅ Material uploaded!');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete Material', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteMaterial(id); await refresh(); } },
    ]);
  }

  return (
    <View style={sec.box}>
      <SectionHeader title="Learning Materials" icon="book-outline" onAdd={() => setShowForm(v => !v)} />
      {showForm && (
        <View style={sec.form}>
          <Text style={fi.label}>Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.sm }}>
            {['100','200','300','400'].map(l => (
              <TouchableOpacity key={l} style={[sec.chip, form.level === l && sec.chipOn]} onPress={() => setForm(f => ({ ...f, level: l }))}>
                <Text style={[sec.chipTx, form.level === l && sec.chipTxOn]}>Level {l}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={fi.label}>Semester</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.sm }}>
            {['1','2'].map(s => (
              <TouchableOpacity key={s} style={[sec.chip, form.semester === s && sec.chipOn]} onPress={() => setForm(f => ({ ...f, semester: s }))}>
                <Text style={[sec.chipTx, form.semester === s && sec.chipTxOn]}>Sem {s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Field label="Course Code" value={form.courseCode} onChangeText={v => setForm(f => ({ ...f, courseCode: v }))} placeholder="e.g. GE 305" />
          <Field label="Course Name" value={form.courseName} onChangeText={v => setForm(f => ({ ...f, courseName: v }))} />
          <TouchableOpacity style={sec.photoPick} onPress={pickFile}>
            <Ionicons name="document-outline" size={18} color={COLORS.muted} />
            <Text style={sec.photoTx} numberOfLines={1}>{fileName || 'Pick PDF file'}</Text>
          </TouchableOpacity>
          <FormBtns onCancel={() => setShowForm(false)} onSave={handleSave} saving={saving} saveLabel="Upload" />
        </View>
      )}
      {loading ? <ActivityIndicator color={COLORS.gold2} style={{ margin: S.md }} />
        : list.map(m => <ItemRow key={m.id} name={`${m.courseCode} — ${m.courseName}`} sub={`Level ${m.level} · Sem ${m.semester}`} onDelete={() => handleDelete(m.id)} />)}
    </View>
  );
}

// ─── PAST QUESTIONS ───────────────────────────────────────────────────────────
function PastQuestionsSection() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ level: '', semester: '', courseCode: '', courseName: '', year: '' });
  const [fileUri, setFileUri]   = useState(null);
  const [fileName, setFileName] = useState('');
  const [saving, setSaving]     = useState(false);

  const refresh = async () => { setLoading(true); try { setList(await getAllPastQuestions()); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);

  async function pickFile() {
    const r = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!r.canceled && r.assets?.length > 0) { setFileUri(r.assets[0].uri); setFileName(r.assets[0].name); }
  }

  async function handleSave() {
    if (!form.level || !form.courseCode || !form.year || !fileUri) { Alert.alert('Fill all fields and pick a PDF'); return; }
    setSaving(true);
    try {
      const fileUrl = await uploadFile(fileUri, `gesa/pastq/level${form.level}/sem${form.semester}`);
      await addPastQuestion({ ...form, fileUrl }); await refresh();
      setForm({ level: '', semester: '', courseCode: '', courseName: '', year: '' }); setFileUri(null); setFileName(''); setShowForm(false);
      Alert.alert('✅ Past question uploaded!');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete Past Question', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deletePastQuestion(id); await refresh(); } },
    ]);
  }

  return (
    <View style={sec.box}>
      <SectionHeader title="Past Questions" icon="document-text-outline" onAdd={() => setShowForm(v => !v)} />
      {showForm && (
        <View style={sec.form}>
          <Text style={fi.label}>Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.sm }}>
            {['100','200','300','400'].map(l => (
              <TouchableOpacity key={l} style={[sec.chip, form.level === l && sec.chipOn]} onPress={() => setForm(f => ({ ...f, level: l }))}>
                <Text style={[sec.chipTx, form.level === l && sec.chipTxOn]}>Level {l}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={fi.label}>Semester</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.sm }}>
            {['1','2'].map(s => (
              <TouchableOpacity key={s} style={[sec.chip, form.semester === s && sec.chipOn]} onPress={() => setForm(f => ({ ...f, semester: s }))}>
                <Text style={[sec.chipTx, form.semester === s && sec.chipTxOn]}>Sem {s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Field label="Course Code" value={form.courseCode} onChangeText={v => setForm(f => ({ ...f, courseCode: v }))} placeholder="e.g. GE 305" />
          <Field label="Course Name" value={form.courseName} onChangeText={v => setForm(f => ({ ...f, courseName: v }))} />
          <Field label="Year" value={form.year} onChangeText={v => setForm(f => ({ ...f, year: v }))} placeholder="e.g. 2024" keyboardType="numeric" />
          <TouchableOpacity style={sec.photoPick} onPress={pickFile}>
            <Ionicons name="document-outline" size={18} color={COLORS.muted} />
            <Text style={sec.photoTx} numberOfLines={1}>{fileName || 'Pick PDF file'}</Text>
          </TouchableOpacity>
          <FormBtns onCancel={() => setShowForm(false)} onSave={handleSave} saving={saving} saveLabel="Upload" />
        </View>
      )}
      {loading ? <ActivityIndicator color={COLORS.gold2} style={{ margin: S.md }} />
        : list.map(p => <ItemRow key={p.id} name={`${p.courseCode} ${p.year}`} sub={`Level ${p.level} · Sem ${p.semester}`} onDelete={() => handleDelete(p.id)} />)}
    </View>
  );
}

// ─── EXAMS ────────────────────────────────────────────────────────────────────
function ExamsSection() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', startDate: '', endDate: '', note: '' });
  const [saving, setSaving]     = useState(false);

  const refresh = async () => { setLoading(true); try { setList(await getAllExams()); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);

  async function handleSave() {
    if (!form.title || !form.startDate) { Alert.alert('Fill title and start date'); return; }
    setSaving(true);
    try {
      await addExam(form); await refresh();
      setForm({ title: '', startDate: '', endDate: '', note: '' }); setShowForm(false);
      Alert.alert('✅ Exam period added!');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete Exam', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteExam(id); await refresh(); } },
    ]);
  }

  return (
    <View style={sec.box}>
      <SectionHeader title="Exam Countdown" icon="alarm-outline" onAdd={() => setShowForm(v => !v)} />
      {showForm && (
        <View style={sec.form}>
          <Field label="Title" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. End of Semester 2 Exams" />
          <Field label="Start Date & Time" value={form.startDate} onChangeText={v => setForm(f => ({ ...f, startDate: v }))} placeholder="e.g. 2025-06-10T09:00:00Z" />
          <Field label="End Date (optional)" value={form.endDate} onChangeText={v => setForm(f => ({ ...f, endDate: v }))} placeholder="e.g. 2025-06-21T17:00:00Z" />
          <Field label="Note (optional)" value={form.note} onChangeText={v => setForm(f => ({ ...f, note: v }))} placeholder="e.g. Check notice board for timetable" multiline />
          <FormBtns onCancel={() => setShowForm(false)} onSave={handleSave} saving={saving} />
        </View>
      )}
      {loading ? <ActivityIndicator color={COLORS.gold2} style={{ margin: S.md }} />
        : list.map(ex => {
          const d = ex.startDate?.toDate ? ex.startDate.toDate() : new Date(ex.startDate);
          return <ItemRow key={ex.id} name={ex.title} sub={`Starts ${d.toDateString()}`} onDelete={() => handleDelete(ex.id)} />;
        })}
    </View>
  );
}

// ─── TUTORIALS ────────────────────────────────────────────────────────────────
function TutorialsSection() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', software: '', youtubeUrl: '', thumbnailUrl: '', description: '' });
  const [saving, setSaving]     = useState(false);

  const refresh = async () => { setLoading(true); try { setList(await getAllTutorials()); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);

  async function handleSave() {
    if (!form.title || !form.youtubeUrl) { Alert.alert('Fill title and YouTube link'); return; }
    setSaving(true);
    try {
      await addTutorial(form); await refresh();
      setForm({ title: '', software: '', youtubeUrl: '', thumbnailUrl: '', description: '' }); setShowForm(false);
      Alert.alert('✅ Tutorial added!');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete Tutorial', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTutorial(id); await refresh(); } },
    ]);
  }

  return (
    <View style={sec.box}>
      <SectionHeader title="Tutorials" icon="play-circle-outline" onAdd={() => setShowForm(v => !v)} />
      {showForm && (
        <View style={sec.form}>
          <Field label="Title" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Getting started with ArcGIS Pro" />
          <Field label="Software" value={form.software} onChangeText={v => setForm(f => ({ ...f, software: v }))} placeholder="e.g. ArcGIS Pro" />
          <Field label="YouTube Link" value={form.youtubeUrl} onChangeText={v => setForm(f => ({ ...f, youtubeUrl: v }))} placeholder="https://youtube.com/…" />
          <Field label="Thumbnail URL (optional)" value={form.thumbnailUrl} onChangeText={v => setForm(f => ({ ...f, thumbnailUrl: v }))} placeholder="https://…" />
          <Field label="Description (optional)" value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
          <FormBtns onCancel={() => setShowForm(false)} onSave={handleSave} saving={saving} />
        </View>
      )}
      {loading ? <ActivityIndicator color={COLORS.gold2} style={{ margin: S.md }} />
        : list.map(t => <ItemRow key={t.id} name={t.title} sub={t.software || 'General'} onDelete={() => handleDelete(t.id)} />)}
    </View>
  );
}

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
function PushNotificationSection() {
  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState(null);

  async function sendNotification() {
    if (!title.trim() || !body.trim()) { Alert.alert('Fill title and message'); return; }
    Alert.alert(
      'Send to all students?',
      `"${title}" will be sent to all registered devices.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send', onPress: async () => {
            setSending(true);
            try {
              const tokens = await getAllPushTokens();
              if (tokens.length === 0) { Alert.alert('No registered devices yet'); return; }

              // Send via Expo Push API
              const messages = tokens.map(to => ({
                to, sound: 'default', title: title.trim(), body: body.trim(),
                data: { type: 'admin_blast' },
              }));

              // Expo allows up to 100 per request — chunk if needed
              const chunks = [];
              for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100));

              for (const chunk of chunks) {
                await fetch('https://exp.host/--/api/v2/push/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Encoding': 'gzip, deflate' },
                  body: JSON.stringify(chunk),
                });
              }

              setLastSent(`"${title}" → ${tokens.length} device${tokens.length === 1 ? '' : 's'}`);
              setTitle(''); setBody('');
              Alert.alert('✅ Sent!', `Notification delivered to ${tokens.length} device${tokens.length === 1 ? '' : 's'}`);
            } catch (e) { Alert.alert('Error', e.message); }
            finally { setSending(false); }
          },
        },
      ]
    );
  }

  return (
    <View style={sec.box}>
      <SectionHeader title="Push Notifications" icon="notifications-outline" />
      <View style={sec.form}>
        <Text style={sec.formTitle}>Blast to all students</Text>
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Exam reminder" />
        <Field label="Message" value={body} onChangeText={setBody} placeholder="e.g. GE 305 exam starts at 9am tomorrow in Hall A" multiline />
        <TouchableOpacity style={[sec.saveBtn, { marginTop: S.sm }]} onPress={sendNotification} disabled={sending}>
          {sending
            ? <ActivityIndicator color="#000" />
            : <><Ionicons name="send-outline" size={14} color="#000" /><Text style={[sec.saveTx, { marginLeft: 6 }]}>Send to All</Text></>
          }
        </TouchableOpacity>
        {!!lastSent && (
          <Text style={{ color: COLORS.green, fontSize: 11, marginTop: S.sm, textAlign: 'center' }}>
            Last sent: {lastSent}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function AdminScreen() {
  const sections = [
    { key: 'exec',  label: 'Executives',    icon: 'ribbon-outline',        component: <ExecutivesSection /> },
    { key: 'lec',   label: 'Lecturers',      icon: 'school-outline',        component: <LecturersSection /> },
    { key: 'events',label: 'Events',         icon: 'calendar-outline',      component: <EventsSection /> },
    { key: 'ann',   label: 'Announcements',  icon: 'megaphone-outline',     component: <AnnouncementsSection /> },
    { key: 'word',  label: 'Word of Day',    icon: 'text-outline',          component: <WordOfDaySection /> },
    { key: 'mat',   label: 'Materials',      icon: 'book-outline',          component: <MaterialsSection /> },
    { key: 'pq',    label: 'Past Questions', icon: 'document-text-outline', component: <PastQuestionsSection /> },
    { key: 'exams', label: 'Exams',          icon: 'alarm-outline',         component: <ExamsSection /> },
    { key: 'tutorials', label: 'Tutorials',  icon: 'play-circle-outline',   component: <TutorialsSection /> },
    { key: 'push',  label: 'Notifications',  icon: 'notifications-outline', component: <PushNotificationSection /> },
  ];

  const [active, setActive] = useState('exec');
  const current = sections.find(s => s.key === active);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons name="shield-checkmark" size={12} color={COLORS.gold2} />
          <Text style={styles.headerBadgeTx}>ADMIN PANEL</Text>
        </View>
        <Text style={styles.headerTitle}>GESA Admin</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={{ paddingHorizontal: S.lg, gap: S.sm }}>
        {sections.map(s => (
          <TouchableOpacity key={s.key} style={[styles.tabChip, active === s.key && styles.tabChipOn]} onPress={() => setActive(s.key)}>
            <Ionicons name={s.icon} size={12} color={active === s.key ? '#000' : COLORS.muted} />
            <Text style={[styles.tabChipTx, active === s.key && styles.tabChipTxOn]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: S.lg, paddingBottom: 48 }}>
        {current?.component}
      </ScrollView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: COLORS.bg },
  header:        { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.lg },
  headerBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  headerBadgeTx: { color: COLORS.gold3, fontSize: 10, fontWeight: '700' },
  headerTitle:   { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  tabBar:        { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabChip:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: S.md, paddingVertical: S.sm, borderRadius: RADIUS.pill, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignSelf: 'center' },
  tabChipOn:     { backgroundColor: COLORS.gold2, borderColor: COLORS.gold2 },
  tabChipTx:     { color: COLORS.muted, fontSize: 11 },
  tabChipTxOn:   { color: '#000', fontWeight: '700' },
});
const sec = StyleSheet.create({
  box:        { backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: S.lg, overflow: 'hidden' },
  form:       { padding: S.md, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  formTitle:  { color: COLORS.gold2, fontSize: 11, fontWeight: '700', marginBottom: S.sm, textTransform: 'uppercase', letterSpacing: 1 },
  formBtns:   { flexDirection: 'row', gap: S.md, marginTop: S.sm },
  saveBtn:    { flexDirection: 'row', justifyContent: 'center', backgroundColor: COLORS.gold2, borderRadius: RADIUS.sm, padding: S.md, alignItems: 'center' },
  saveTx:     { color: '#000', fontWeight: '700', fontSize: 13 },
  cancelBtn:  { flex: 1, borderRadius: RADIUS.sm, padding: S.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelTx:   { color: COLORS.muted, fontSize: 13 },
  chip:       { paddingHorizontal: S.md, paddingVertical: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.border, marginRight: S.sm },
  chipOn:     { backgroundColor: COLORS.gold2, borderColor: COLORS.gold2 },
  chipTx:     { color: COLORS.muted, fontSize: 11 },
  chipTxOn:   { color: '#000', fontWeight: '700' },
  switchRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm },
  photoPick:  { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: COLORS.card2, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, padding: S.md, marginBottom: S.sm },
  photoTx:    { color: COLORS.muted, fontSize: 13, flex: 1 },
  photoPreview: { width: 60, height: 60, borderRadius: 30 },
  photoNote:  { color: COLORS.dim, fontSize: 10, marginBottom: S.sm },
});
const sh = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: S.md },
  title:  { flex: 1, color: COLORS.text, fontWeight: '700', fontSize: 14 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.gold2, borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 5 },
  addTx:  { color: '#000', fontSize: 11, fontWeight: '700' },
});
const fi = StyleSheet.create({
  label: { color: COLORS.muted, fontSize: 11, marginBottom: 4 },
  input: { backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: S.md, color: COLORS.text, fontSize: 13 },
});
const ir = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.md, paddingVertical: S.sm, borderTopWidth: 1, borderTopColor: COLORS.border, gap: S.sm },
  name:    { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  sub:     { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  editBtn: { padding: S.sm, backgroundColor: 'rgba(232,184,42,0.08)', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: 'rgba(232,184,42,0.2)' },
  delBtn:  { padding: S.sm, backgroundColor: 'rgba(248,113,113,0.08)', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)' },
});
