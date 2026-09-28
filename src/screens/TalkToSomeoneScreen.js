import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useExecutives, useSiteContent } from '../hooks/useFirestore';
import { Loader, OfflineBanner, appRefreshControl } from '../components/SharedComponents';

const S = SPACING;

// "024 000 0001" / "+233 24 000 0001" / "0240000001" → "233240000001"
function toWhatsAppNumber(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '233' + d.slice(1);
  return d;
}
const toTel = (raw) => `tel:${String(raw || '').replace(/[^\d+]/g, '')}`;

function ContactCard({ person }) {
  const wa = toWhatsAppNumber(person.whatsapp || person.phone);
  const initials = (person.name || 'GE').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {person.photoUrl ? (
          <Image source={{ uri: person.photoUrl }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.role}>{person.position || 'Welfare Chairman'}</Text>
          {!!person.phone && <Text style={styles.number}>{person.phone}</Text>}
        </View>
      </View>
      <View style={styles.btnRow}>
        {!!person.phone && (
          <TouchableOpacity style={[styles.btn, styles.btnGold]} activeOpacity={0.85}
            onPress={() => Linking.openURL(toTel(person.phone))}>
            <Ionicons name="call" size={16} color="#1a1200" />
            <Text style={styles.btnGoldTx}>Call</Text>
          </TouchableOpacity>
        )}
        {!!wa && (
          <TouchableOpacity style={[styles.btn, styles.btnOutline]} activeOpacity={0.85}
            onPress={() => Linking.openURL(`https://wa.me/${wa}`)}>
            <Ionicons name="logo-whatsapp" size={16} color={COLORS.green} />
            <Text style={styles.btnOutlineTx}>WhatsApp</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function TalkToSomeoneScreen() {
  const exec = useExecutives();
  const site = useSiteContent();
  const contacts = (exec.data || []).filter(e => e.isWelfareChair);
  const clinicPhone = site.data?.clinicPhone;
  const clinicNote = site.data?.clinicNote;

  const refreshing = exec.refreshing || site.refreshing;
  const refresh = () => { exec.refresh && exec.refresh(); site.refresh && site.refresh(); };

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      refreshControl={appRefreshControl(!!refreshing, refresh)}
    >
      <OfflineBanner visible={exec.offline} savedAt={exec.savedAt} />

      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="heart-outline" size={11} color={COLORS.gold3} />
          <Text style={styles.heroBadgeTx}>Student welfare</Text>
        </View>
        <Text style={styles.heroTitle}>Talk to Someone</Text>
        <Text style={styles.heroSub}>
          Behind on fees? Fell ill in the middle of exams? Carrying something heavy you haven't told anyone?
          You don't have to sort it out by yourself.
        </Text>
      </View>

      <View style={styles.body}>
        {exec.loading ? (
          <Loader />
        ) : contacts.length === 0 ? (
          <View style={styles.pending}>
            <Text style={styles.pendingTx}>
              The welfare contact will be listed here shortly. Until then, you can reach any member of the
              executive team from the Leaders page.
            </Text>
          </View>
        ) : (
          contacts.map(p => <ContactCard key={p.id} person={p} />)
        )}

        {!!clinicPhone && (
          <View style={styles.clinic}>
            <Text style={styles.clinicTitle}>If it's a medical emergency</Text>
            <Text style={styles.clinicTx}>
              Don't wait to reach the welfare team. Call the school clinic straight away.
              {clinicNote ? ` ${clinicNote}` : ''}
            </Text>
            <TouchableOpacity style={[styles.btn, styles.btnOutline, { alignSelf: 'flex-start', marginTop: S.md }]}
              activeOpacity={0.85} onPress={() => Linking.openURL(toTel(clinicPhone))}>
              <Ionicons name="medkit-outline" size={16} color={COLORS.gold2} />
              <Text style={styles.btnOutlineTx}>Call the clinic · {clinicPhone}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.headline}>Someone in this department is quietly struggling right now.</Text>
        <Text style={styles.p}>
          Fees you can't cover this semester. An illness that hit during exams. A situation at home that has
          taken over everything else. Most students in that position say nothing, because it feels like
          something to handle alone.
        </Text>
        <Text style={styles.p}>
          You don't have to. GESA has a Welfare Committee, and its chairman is a fellow student who will
          listen, take you seriously, and help work out what support is possible, including help with dues.
        </Text>
        <Text style={styles.p}>
          Call or send a WhatsApp message, whichever feels easier. Nothing you say goes through this app or is
          stored here. It's a conversation between you and them.
        </Text>

        <View style={styles.quote}>
          <Text style={styles.quoteTitle}>Know someone who is struggling?</Text>
          <Text style={styles.quoteTx}>
            The person who most needs help is often the last to ask. If a coursemate has gone quiet or mentioned
            money or health trouble, share this with them, or reach out to the welfare team on their behalf.
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: COLORS.bg },
  hero:         { backgroundColor: '#1c1048', paddingHorizontal: S.xl, paddingTop: S.xl, paddingBottom: S.xxl },
  heroBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(212,160,23,0.11)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.28)', borderRadius: RADIUS.pill, paddingHorizontal: S.md, paddingVertical: 4, marginBottom: S.sm },
  heroBadgeTx:  { color: COLORS.gold3, fontSize: 10 },
  heroTitle:    { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  heroSub:      { color: COLORS.muted, fontSize: 13, marginTop: 8, lineHeight: 20 },
  body:         { paddingHorizontal: S.lg, paddingTop: S.lg },

  card:         { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: S.md, marginBottom: S.md },
  cardTop:      { flexDirection: 'row', gap: S.md, alignItems: 'center' },
  photo:        { width: 76, height: 96, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: 'rgba(212,160,23,0.35)' },
  photoFallback:{ backgroundColor: '#5b21b6', alignItems: 'center', justifyContent: 'center' },
  initials:     { color: '#fff', fontWeight: '700', fontSize: 22 },
  name:         { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  role:         { color: COLORS.gold2, fontSize: 12, marginTop: 3 },
  number:       { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  btnRow:       { flexDirection: 'row', gap: S.sm, marginTop: S.md },
  btn:          { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: S.lg, paddingVertical: 11, borderRadius: RADIUS.sm },
  btnGold:      { backgroundColor: COLORS.gold2 },
  btnGoldTx:    { color: '#1a1200', fontWeight: '700', fontSize: 13 },
  btnOutline:   { borderWidth: 1, borderColor: COLORS.border2 },
  btnOutlineTx: { color: COLORS.text, fontWeight: '600', fontSize: 13 },

  pending:      { borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.border2, borderRadius: RADIUS.md, padding: S.lg, marginBottom: S.md },
  pendingTx:    { color: COLORS.muted, fontSize: 13, lineHeight: 20 },

  clinic:       { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: S.md, marginBottom: S.lg },
  clinicTitle:  { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  clinicTx:     { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },

  headline:     { color: COLORS.text, fontSize: 17, fontWeight: '700', lineHeight: 24, marginTop: S.md, marginBottom: S.md },
  p:            { color: COLORS.muted, fontSize: 13.5, lineHeight: 21, marginBottom: S.md },
  quote:        { borderLeftWidth: 2, borderLeftColor: COLORS.gold, paddingLeft: S.md, marginTop: S.md },
  quoteTitle:   { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  quoteTx:      { color: COLORS.muted, fontSize: 13, lineHeight: 20 },
});
