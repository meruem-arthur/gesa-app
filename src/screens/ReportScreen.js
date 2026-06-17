import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { addReport } from '../hooks/useFirestore';

const S = SPACING;
const MAX_LENGTH = 600;

export default function ReportScreen() {
  const [message, setMessage]   = useState('');
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState(null);

  async function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) {
      setError('Please write something before sending.');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await addReport(trimmed);
      setSent(true);
      setMessage('');
    } catch (e) {
      setError('Could not send your report. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <View style={styles.screen}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="flag-outline" size={11} color={COLORS.gold3} />
            <Text style={styles.heroBadgeTx}>Anonymous</Text>
          </View>
          <Text style={styles.heroTitle}>Report an Issue</Text>
          <Text style={styles.heroSub}>Tell us what's wrong — we read every report</Text>
        </View>

        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
          </View>
          <Text style={styles.successTitle}>Report sent!</Text>
          <Text style={styles.successSub}>
            Thank you for letting us know. The GESA admin team will look into this.
          </Text>
          <TouchableOpacity style={styles.againBtn} onPress={() => setSent(false)} activeOpacity={0.8}>
            <Ionicons name="add-circle-outline" size={16} color={COLORS.gold2} />
            <Text style={styles.againTx}>Send another report</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="flag-outline" size={11} color={COLORS.gold3} />
            <Text style={styles.heroBadgeTx}>Anonymous</Text>
          </View>
          <Text style={styles.heroTitle}>Report an Issue</Text>
          <Text style={styles.heroSub}>Tell us what's wrong — we read every report</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>What's bothering you?</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Describe the issue, bug, or concern you'd like to report. Be as specific as you can — the more detail, the easier it is for us to fix it."
            placeholderTextColor={COLORS.dim}
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={(t) => { setMessage(t.slice(0, MAX_LENGTH)); setError(null); }}
          />
          <Text style={styles.counter}>{message.length}/{MAX_LENGTH}</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color="#f87171" />
              <Text style={styles.errorTx}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.sendBtn, (!message.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSubmit}
            disabled={!message.trim() || sending}
            activeOpacity={0.85}
          >
            {sending
              ? <ActivityIndicator size="small" color="#000" />
              : (
                <>
                  <Ionicons name="paper-plane-outline" size={16} color="#000" />
                  <Text style={styles.sendTx}>Send Report</Text>
                </>
              )
            }
          </TouchableOpacity>

          <View style={styles.infoStrip}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.muted} />
            <Text style={styles.infoTx}>
              This is fully anonymous — no name, email, or device info is attached to your report.
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: COLORS.bg },
  hero:          { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  heroBadge:     { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  heroBadgeTx:   { color: COLORS.gold3, fontSize: 10 },
  heroTitle:     { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  heroSub:       { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  body:          { paddingHorizontal: S.lg, paddingTop: S.lg },
  label:         { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: S.sm },
  textarea:      { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: S.md, color: COLORS.text, fontSize: 13, minHeight: 160, lineHeight: 19 },
  counter:       { color: COLORS.dim, fontSize: 10, textAlign: 'right', marginTop: 4 },
  errorBox:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)', borderRadius: RADIUS.sm, padding: S.sm, marginTop: S.sm },
  errorTx:       { color: '#f87171', fontSize: 12, flex: 1 },
  sendBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.gold2, borderRadius: RADIUS.md, paddingVertical: 13, marginTop: S.lg },
  sendBtnDisabled: { opacity: 0.5 },
  sendTx:        { color: '#000', fontSize: 13, fontWeight: '700' },
  infoStrip:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: S.lg, paddingHorizontal: S.sm },
  infoTx:        { color: COLORS.muted, fontSize: 11, flex: 1, lineHeight: 16 },
  successWrap:   { alignItems: 'center', paddingHorizontal: S.xl, paddingTop: S.xxl * 1.5 },
  successIcon:   { marginBottom: S.lg },
  successTitle:  { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: S.sm },
  successSub:    { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: S.xl },
  againBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(212,160,23,0.3)', borderRadius: RADIUS.pill, paddingHorizontal: S.lg, paddingVertical: 10 },
  againTx:       { color: COLORS.gold2, fontSize: 12, fontWeight: '600' },
});
