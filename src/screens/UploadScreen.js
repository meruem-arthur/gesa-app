import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadFile } from '../../cloudinary';

export default function UploadScreen() {
  const [type, setType]           = useState('learningMaterials');
  const [level, setLevel]         = useState('100');
  const [semester, setSemester]   = useState('1');
  const [year, setYear]           = useState('2024');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [file, setFile]           = useState(null);
  const [loading, setLoading]     = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled) setFile(result.assets[0]);
  };

  const handleUpload = async () => {
    if (!file || !courseCode || !courseName) {
      Alert.alert('Missing fields', 'Fill in all fields and pick a PDF');
      return;
    }
    try {
      setLoading(true);
      // 1. Upload PDF to Cloudinary
      const folder  = `gesa/${type}/level${level}/sem${semester}`;
      const fileUrl  = await uploadFile(file.uri, folder);
      // 2. Save record to Firestore
      const doc = {
        level: parseInt(level),
        semester: parseInt(semester),
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        fileUrl,
        uploadedAt: Timestamp.now(),
        ...(type === 'pastQuestions' && { year: parseInt(year) }),
      };
      await addDoc(collection(db, type), doc);
      Alert.alert('✅ Done!', `${courseCode} uploaded successfully`);
      setFile(null); setCourseCode(''); setCourseName('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      {/* Type toggle */}
      <View style={styles.row}>
        {['learningMaterials', 'pastQuestions'].map(t => (
          <TouchableOpacity key={t} style={[styles.pill, type===t && styles.pillOn]} onPress={()=>setType(t)}>
            <Text style={[styles.pillTx, type===t && styles.pillTxOn]}>{t === 'learningMaterials' ? 'Material' : 'Past Q'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Level */}
      <Text style={styles.lbl}>Level</Text>
      <View style={styles.row}>
        {['100','200','300','400'].map(l => (
          <TouchableOpacity key={l} style={[styles.pill, level===l && styles.pillOn]} onPress={()=>setLevel(l)}>
            <Text style={[styles.pillTx, level===l && styles.pillTxOn]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Semester */}
      <Text style={styles.lbl}>Semester</Text>
      <View style={styles.row}>
        {['1','2'].map(s => (
          <TouchableOpacity key={s} style={[styles.pill, semester===s && styles.pillOn]} onPress={()=>setSemester(s)}>
            <Text style={[styles.pillTx, semester===s && styles.pillTxOn]}>Sem {s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Year — only for past questions */}
      {type === 'pastQuestions' && (
        <>
          <Text style={styles.lbl}>Year</Text>
          <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" placeholder="e.g. 2023" />
        </>
      )}
      {/* Course fields */}
      <Text style={styles.lbl}>Course Code</Text>
      <TextInput style={styles.input} value={courseCode} onChangeText={setCourseCode} placeholder="e.g. GE 201" autoCapitalize="characters" />
      <Text style={styles.lbl}>Course Name</Text>
      <TextInput style={styles.input} value={courseName} onChangeText={setCourseName} placeholder="e.g. Surveying II" />
      {/* File picker */}
      <TouchableOpacity style={styles.pickBtn} onPress={pickFile}>
        <Text style={styles.pickTx}>{file ? `📄 ${file.name}` : 'Pick PDF file'}</Text>
      </TouchableOpacity>
      {/* Upload */}
      <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} disabled={loading}>
        {loading ? <ActivityIndicator color="#1a0e00" /> : <Text style={styles.uploadTx}>Upload to GESA</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:    { flex:1, backgroundColor:'#07050f', padding:20 },
  lbl:       { color:'#9b8ec0', fontSize:12, marginTop:14, marginBottom:6 },
  row:       { flexDirection:'row', gap:8, flexWrap:'wrap' },
  pill:      { paddingHorizontal:14, paddingVertical:7, borderRadius:20, borderWidth:1, borderColor:'rgba(180,130,255,0.2)' },
  pillOn:    { backgroundColor:'rgba(232,184,42,0.15)', borderColor:'rgba(232,184,42,0.4)' },
  pillTx:    { color:'#584f7a', fontSize:13 },
  pillTxOn:  { color:'#f5cc5c' },
  input:     { backgroundColor:'#17132e', borderWidth:1, borderColor:'rgba(180,130,255,0.15)', borderRadius:10, padding:12, color:'#f0ecff', fontSize:13, marginBottom:4 },
  pickBtn:   { backgroundColor:'#17132e', borderWidth:1, borderColor:'rgba(232,184,42,0.3)', borderRadius:10, padding:14, alignItems:'center', marginTop:14 },
  pickTx:    { color:'#e8b82a', fontSize:13 },
  uploadBtn: { backgroundColor:'#e8b82a', borderRadius:12, padding:15, alignItems:'center', marginTop:14 },
  uploadTx:  { color:'#1a0e00', fontSize:14, fontWeight:'600' },
});