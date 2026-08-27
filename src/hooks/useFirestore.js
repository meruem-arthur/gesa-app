import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, where,
  getDocs, addDoc, updateDoc, deleteDoc,
  doc, limit, Timestamp, setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';

// ─── READ HOOKS ───────────────────────────────────────────────────────────────

export function useWordOfDay() {
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'wordOfTheDay'), orderBy('date', 'desc'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) setWord({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);
  return { word, loading, error };
}

export function useEvents() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));
        const snap = await getDocs(q);
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);
  return { data, loading, error };
}

export function useExecutives() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'executives'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);
  return { data, loading, error };
}

export function useLecturers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'lecturers'));
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => {
          const aPinned = !!a.pinnedRole;
          const bPinned = !!b.pinnedRole;
          if (aPinned && !bPinned) return -1;
          if (!aPinned && bPinned) return 1;
          return a.name.localeCompare(b.name);
        });
        setData(docs);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);
  return { data, loading, error };
}

export function useMaterials(level, semester) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'learningMaterials'),
          where('level', '==', level),
          where('semester', '==', semester),
          orderBy('courseCode', 'asc')
        );
        const snap = await getDocs(q);
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [level, semester]);
  return { data, loading, error };
}

export function usePastQuestions(level, semester) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'pastQuestions'),
          where('level', '==', level),
          where('semester', '==', semester),
          orderBy('courseCode', 'asc'),
          orderBy('year', 'desc')
        );
        const snap = await getDocs(q);
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [level, semester]);
  return { data, loading, error };
}

export function useAnnouncements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);
  return { data, loading, error };
}

// ─── WRITE / DELETE ───────────────────────────────────────────────────────────

export async function addExecutive(data) {
  return addDoc(collection(db, 'executives'), {
    name: data.name, position: data.position,
    order: Number(data.order) || 99,
    photoUrl: data.photoUrl || '',
    phone: data.phone || '',
    bio: data.bio || '',
  });
}
export async function updateExecutive(id, data) { return updateDoc(doc(db, 'executives', id), data); }
export async function deleteExecutive(id) { return deleteDoc(doc(db, 'executives', id)); }

export async function addLecturer(data) {
  return addDoc(collection(db, 'lecturers'), {
    name: data.name, title: data.title || 'Lecturer',
    major: data.major || '', phone: data.phone || '',
    email: data.email || '', pinnedRole: data.pinnedRole || '',
    photoUrl: data.photoUrl || '',
  });
}
export async function updateLecturer(id, data) { return updateDoc(doc(db, 'lecturers', id), data); }
export async function deleteLecturer(id) { return deleteDoc(doc(db, 'lecturers', id)); }

export async function addEvent(data) {
  return addDoc(collection(db, 'events'), {
    title: data.title, description: data.description || '',
    date: Timestamp.fromDate(new Date(data.date)),
    location: data.location || '', tag: data.tag || 'General',
    featured: data.featured || false,
    imageUrl: data.imageUrl || '',
  });
}
export async function updateEvent(id, data) {
  const payload = { ...data };
  if (data.date) payload.date = Timestamp.fromDate(new Date(data.date));
  return updateDoc(doc(db, 'events', id), payload);
}
export async function deleteEvent(id) { return deleteDoc(doc(db, 'events', id)); }

export async function addAnnouncement(data) {
  return addDoc(collection(db, 'announcements'), {
    title: data.title, body: data.body,
    tag: data.tag || 'General', color: data.color || 'purple',
    author: data.author || 'GESA Admin',
    createdAt: Timestamp.now(),
  });
}
export async function updateAnnouncement(id, data) { return updateDoc(doc(db, 'announcements', id), data); }
export async function deleteAnnouncement(id) { return deleteDoc(doc(db, 'announcements', id)); }

export async function addWordOfDay(data) {
  return addDoc(collection(db, 'wordOfTheDay'), {
    word: data.word, type: data.type || '',
    definition: data.definition, example: data.example || '',
    date: data.date,
  });
}
export async function deleteWordOfDay(id) { return deleteDoc(doc(db, 'wordOfTheDay', id)); }

export async function addMaterial(data) {
  return addDoc(collection(db, 'learningMaterials'), {
    level: Number(data.level), semester: Number(data.semester),
    courseCode: data.courseCode, courseName: data.courseName,
    fileUrl: data.fileUrl, fileName: data.fileName || '',
    uploadedAt: Timestamp.now(),
  });
}
export async function deleteMaterial(id) { return deleteDoc(doc(db, 'learningMaterials', id)); }

export async function addPastQuestion(data) {
  return addDoc(collection(db, 'pastQuestions'), {
    level: Number(data.level), semester: Number(data.semester),
    courseCode: data.courseCode, courseName: data.courseName,
    year: Number(data.year), fileUrl: data.fileUrl,
    fileName: data.fileName || '', uploadedAt: Timestamp.now(),
  });
}
export async function deletePastQuestion(id) { return deleteDoc(doc(db, 'pastQuestions', id)); }

// ─── EXAMS ────────────────────────────────────────────────────────────────────
export async function addExam(data) {
  return addDoc(collection(db, 'exams'), {
    title:     data.title,
    startDate: Timestamp.fromDate(new Date(data.startDate)),
    endDate:   data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
    note:      data.note || '',
  });
}
export async function deleteExam(id) { return deleteDoc(doc(db, 'exams', id)); }
export async function getAllExams() {
  const q = query(collection(db, 'exams'), orderBy('startDate', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function useSoftware() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'software'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);
  return { data, loading, error };
}

// ─── TUTORIALS ────────────────────────────────────────────────────────────────
export function useTutorials() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'tutorials'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);
  return { data, loading, error };
}

export async function addTutorial(data) {
  return addDoc(collection(db, 'tutorials'), {
    title: data.title, software: data.software || '',
    youtubeUrl: data.youtubeUrl, thumbnailUrl: data.thumbnailUrl || '',
    description: data.description || '',
    createdAt: Timestamp.now(),
  });
}
export async function deleteTutorial(id) { return deleteDoc(doc(db, 'tutorials', id)); }
export async function getAllTutorials() {
  const q = query(collection(db, 'tutorials'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── REPORTS (student → admin) ─────────────────────────────────────────────────
export async function addReport(message) {
  return addDoc(collection(db, 'reports'), {
    message: message.trim(),
    status: 'open', // 'open' | 'resolved'
    createdAt: Timestamp.now(),
  });
}

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
export async function saveExpoPushToken(token) {
  if (!token) return;
  return setDoc(
    doc(db, 'pushTokens', token.replace(/[^a-zA-Z0-9]/g, '_')),
    { token, updatedAt: Timestamp.now() },
    { merge: true }
  );
}

export async function getAllPushTokens() {
  const snap = await getDocs(collection(db, 'pushTokens'));
  return snap.docs.map(d => d.data().token).filter(Boolean);
}

// ─── BULK GETTERS (admin) ─────────────────────────────────────────────────────
export async function getAllWordsOfDay() {
  const q = query(collection(db, 'wordOfTheDay'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function getAllMaterials() {
  const q = query(collection(db, 'learningMaterials'), orderBy('level', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function getAllPastQuestions() {
  const q = query(collection(db, 'pastQuestions'), orderBy('level', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
