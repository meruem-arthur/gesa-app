export const COLORS = {
  bg:       '#07050f',
  surface:  '#0f0c22',
  card:     '#17132e',
  card2:    '#1e1a38',
  border:   'rgba(180,130,255,0.13)',
  border2:  'rgba(200,150,255,0.32)',

  // Purple ramp
  p600: '#7c3aed',
  p500: '#8b47f0',
  p400: '#a855f7',
  p300: '#c084fc',
  p200: '#d8b4fe',
  p100: '#ede9ff',

  // Gold ramp
  gold:  '#d4a017',
  gold2: '#e8b82a',
  gold3: '#f5cc5c',
  gold4: '#fde68a',

  text:   '#f0ecff',
  muted:  '#9b8ec0',
  dim:    '#584f7a',

  green: '#4ade80',
  amber: '#f59e0b',
  blue:  '#60a5fa',
  red:   '#f87171',
};

export const FONTS = {
  syne: 'Syne_700Bold',
  syneMed: 'Syne_500Medium',
  dm: 'DMSans_400Regular',
  dmMed: 'DMSans_500Medium',
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 30,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 32,
};

// Frosted "HUD" label used for hero badges and tags. Spread into a StyleSheet entry:
//   heroBadge: { ...GLASS.chip, marginBottom: SPACING.sm }
export const GLASS = {
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(245,204,92,0.42)', borderTopColor: 'rgba(255,255,255,0.38)',
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 5,
  },
  chipText: { color: COLORS.gold3, fontSize: 9.5, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  chipPurple: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.5)', borderTopColor: 'rgba(255,255,255,0.38)',
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 5,
  },
  chipPurpleText: { color: COLORS.p200, fontSize: 9.5, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
};
