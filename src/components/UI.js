import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

// ── Loading spinner ──────────────────────────────────────────────────────────
export function Loader() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.gold2} />
    </View>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
export function Empty({ message = 'Nothing here yet. Check back soon.' }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ── Error state ──────────────────────────────────────────────────────────────
export function ErrorState({ onRetry }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyText}>Something went wrong.</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Section label ────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

// ── Hero section ─────────────────────────────────────────────────────────────
export function Hero({ badge, title, subtitle, badgeColor = 'gold' }) {
  const badgeStyle = badgeColor === 'purple'
    ? { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: 'rgba(168,85,247,0.35)' }
    : { backgroundColor: 'rgba(212,160,23,0.11)', borderColor: 'rgba(212,160,23,0.28)' };
  const badgeTextStyle = badgeColor === 'purple'
    ? { color: colors.p300 }
    : { color: colors.gold3 };

  return (
    <View style={styles.hero}>
      {badge && (
        <View style={[styles.heroBadge, badgeStyle]}>
          <Text style={[styles.heroBadgeText, badgeTextStyle]}>{badge}</Text>
        </View>
      )}
      <Text style={styles.heroTitle}>{title}</Text>
      {subtitle && <Text style={styles.heroSub}>{subtitle}</Text>}
    </View>
  );
}

// ── Pill filter row ──────────────────────────────────────────────────────────
export function PillRow({ options, selected, onSelect }) {
  return (
    <View style={styles.pillRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.pill, selected === opt.value && styles.pillActive]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[styles.pillText, selected === opt.value && styles.pillTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Semester tabs ────────────────────────────────────────────────────────────
export function SemTabs({ selected, onSelect }) {
  return (
    <View style={styles.semTabRow}>
      {[1, 2].map(s => (
        <TouchableOpacity
          key={s}
          style={[styles.semTab, selected === s && styles.semTabActive]}
          onPress={() => onSelect(s)}
        >
          <Text style={[styles.semTabText, selected === s && styles.semTabTextActive]}>
            Semester {s}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Avatar circle ────────────────────────────────────────────────────────────
export function Avatar({ name, size = 44, gradient = 'purple' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const bg = gradient === 'gold'
    ? { backgroundColor: '#92400e' }
    : { backgroundColor: colors.p600 };

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, bg]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>{initials}</Text>
    </View>
  );
}

// ── Badge pill ───────────────────────────────────────────────────────────────
export function Badge({ label, type = 'purple' }) {
  const typeStyles = {
    purple: { bg: 'rgba(168,85,247,0.18)', text: colors.p300, border: 'rgba(168,85,247,0.3)' },
    gold:   { bg: 'rgba(212,160,23,0.15)', text: colors.gold3, border: 'rgba(212,160,23,0.3)' },
    green:  { bg: 'rgba(74,222,128,0.1)',  text: colors.green, border: 'rgba(74,222,128,0.25)' },
    blue:   { bg: 'rgba(96,165,250,0.12)', text: colors.blue,  border: 'rgba(96,165,250,0.25)' },
    amber:  { bg: 'rgba(245,158,11,0.1)',  text: colors.amber, border: 'rgba(245,158,11,0.3)' },
  };
  const s = typeStyles[type] || typeStyles.purple;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  retryBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.goldFill,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  retryText: {
    color: colors.gold3,
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 10,
    color: colors.dim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    fontWeight: '600',
  },
  hero: {
    backgroundColor: '#1c1048',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  heroBadgeText: { fontSize: 10 },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
  },
  heroSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 5,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    marginBottom: 8,
  },
  pillActive: {
    backgroundColor: 'rgba(212,160,23,0.14)',
    borderColor: 'rgba(212,160,23,0.44)',
  },
  pillText: { fontSize: 11, color: colors.muted },
  pillTextActive: { color: colors.gold3 },
  semTabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  semTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  semTabActive: { borderBottomColor: colors.gold2 },
  semTabText: { fontSize: 12, color: colors.muted },
  semTabTextActive: { color: colors.gold2 },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.2)',
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  badge: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginLeft: 'auto',
  },
  badgeText: { fontSize: 9, fontWeight: '600' },
});
