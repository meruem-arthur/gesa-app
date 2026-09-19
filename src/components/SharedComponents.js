import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

// ── Loading spinner ──────────────────────────────────────────
export function Loader() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.gold2} />
    </View>
  );
}

// ── Error state with retry ───────────────────────────────────
export function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{message || 'Something went wrong.'}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Empty state ──────────────────────────────────────────────
export function EmptyState({ icon, message }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyIcon}>{icon || '📭'}</Text>
      <Text style={styles.emptyText}>{message || 'Nothing here yet.'}</Text>
    </View>
  );
}

// ── Offline banner ───────────────────────────────────────────
// Shown when the last network attempt failed and we're displaying the copy
// saved on the phone. `savedAt` is a ms timestamp from useCachedQuery.
export function OfflineBanner({ visible, savedAt }) {
  if (!visible) return null;
  const when = savedAt
    ? new Date(savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null;
  return (
    <View style={ob.wrap}>
      <Ionicons name="cloud-offline-outline" size={14} color={COLORS.gold3} />
      <Text style={ob.text}>
        Offline · showing your saved copy{when ? ` from ${when}` : ''}. Turn on data and pull down to refresh.
      </Text>
    </View>
  );
}

// ── Pull-to-refresh control styled for the app ───────────────
// Use as: <ScrollView refreshControl={appRefreshControl(refreshing, refresh)} />
// This must return a real <RefreshControl> element. On Android, ScrollView
// clones the element it is given and injects the scrollable content as its
// children, so wrapping RefreshControl in our own component (that doesn't pass
// children through) makes the whole screen render empty.
export function appRefreshControl(refreshing, onRefresh) {
  return (
    <RefreshControl
      refreshing={!!refreshing}
      onRefresh={onRefresh}
      tintColor={COLORS.gold2}
      colors={[COLORS.gold2]}
      progressBackgroundColor={COLORS.card}
    />
  );
}

const ob = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: 'rgba(212,160,23,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.28)',
    borderRadius: RADIUS.md,
  },
  text: { flex: 1, color: COLORS.gold3, fontSize: 11, lineHeight: 15 },
});

// ── Section label (uppercase muted) ─────────────────────────
export function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

// ── Gold pill badge ──────────────────────────────────────────
export function GoldBadge({ label }) {
  return (
    <View style={styles.goldBadge}>
      <Text style={styles.goldBadgeText}>{label}</Text>
    </View>
  );
}

// ── Purple pill badge ────────────────────────────────────────
export function PurpleBadge({ label }) {
  return (
    <View style={styles.purpleBadge}>
      <Text style={styles.purpleBadgeText}>{label}</Text>
    </View>
  );
}

// ── Avatar circle with initials ──────────────────────────────
export function Avatar({ name, size = 44, gold = false }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '??';

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        gold ? styles.avatarGold : styles.avatarPurple,
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>{initials}</Text>
    </View>
  );
}

// ── Pill selector (level / semester tabs) ────────────────────
export function PillRow({ options, selected, onSelect }) {
  return (
    <View style={styles.pillRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.pill, selected === opt.value && styles.pillActive]}
          onPress={() => onSelect(opt.value)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, selected === opt.value && styles.pillTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Tab underline selector ───────────────────────────────────
export function TabRow({ tabs, selected, onSelect }) {
  return (
    <View style={styles.tabRow}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.value}
          style={[styles.tab, selected === tab.value && styles.tabActive]}
          onPress={() => onSelect(tab.value)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selected === tab.value && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  errorText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  retryText: {
    color: COLORS.gold2,
    fontSize: 13,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyText: {
    color: COLORS.dim,
    fontSize: 14,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 10,
    color: COLORS.dim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  goldBadge: {
    backgroundColor: 'rgba(212,160,23,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.3)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  goldBadgeText: {
    color: COLORS.gold3,
    fontSize: 9,
    fontWeight: '600',
  },
  purpleBadge: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  purpleBadgeText: {
    color: COLORS.p300,
    fontSize: 9,
    fontWeight: '600',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.2)',
  },
  avatarPurple: {
    backgroundColor: '#5b21b6',
  },
  avatarGold: {
    backgroundColor: '#92400e',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: 'rgba(212,160,23,0.14)',
    borderColor: 'rgba(212,160,23,0.44)',
  },
  pillText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  pillTextActive: {
    color: COLORS.gold3,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.gold2,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  tabTextActive: {
    color: COLORS.gold2,
  },
});
