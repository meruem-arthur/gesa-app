import { StyleSheet } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Two palettes. `COLORS` and `RADIUS` below always resolve to the ACTIVE one,
// so existing code (`COLORS.text`, `RADIUS.md` …) keeps working unchanged.
//
// Rules that keep this safe:
//  • Tokens that get hex-alpha appended (`COLORS.gold2 + '22'`) MUST stay 6-digit hex.
//  • Styles must be built with `themed(() => ({...}))` (not StyleSheet.create) and
//    module-level colour tables with `themedValue(() => ...)`, so they re-evaluate
//    when the theme changes.
// ─────────────────────────────────────────────────────────────────────────────

// ── DARK (the original look — values unchanged) ──────────────────────────────
const DARK = {
  isDark: true,

  bg:       '#07050f',
  surface:  '#0f0c22',
  card:     '#17132e',
  card2:    '#1e1a38',
  border:   'rgba(180,130,255,0.13)',
  border2:  'rgba(200,150,255,0.32)',

  p600: '#7c3aed',
  p500: '#8b47f0',
  p400: '#a855f7',
  p300: '#c084fc',
  p200: '#d8b4fe',
  p100: '#ede9ff',

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
  ok:    '#22c55e',
  purple:'#a855f7',

  // surfaces that used to be hard-coded
  hero:        '#1c1048',
  heroScrim:   'rgba(28,16,72,0.82)',
  heroShape:   { overflow: 'hidden' },
  cardStrong:  '#1e1545',
  sheet:       '#110d2a',
  tabBar:      'rgba(13,10,28,0.98)',
  fillSoft:    'rgba(255,255,255,0.04)',

  // text that sits on hero / glass
  onHero:      '#ffffff',
  onHeroSub:   'rgba(255,255,255,0.75)',
  soft:        '#c9bfe6',
  textGlow:    'rgba(232,184,42,0.55)',
  textShadow:  'rgba(0,0,0,0.5)',

  shadow: {},                       // opaque cards: no drop shadow in dark

  // frosted label ("chip")
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(245,204,92,0.42)', borderTopColor: 'rgba(255,255,255,0.38)',
    borderRadius: 30, paddingHorizontal: 12, paddingVertical: 5,
  },
  chipText: { color: '#f5cc5c', fontSize: 9.5, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  chipPurple: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.5)', borderTopColor: 'rgba(255,255,255,0.38)',
    borderRadius: 30, paddingHorizontal: 12, paddingVertical: 5,
  },
  chipPurpleText: { color: '#d8b4fe', fontSize: 9.5, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },

  // glass material
  glassBase:     'rgba(14,10,34,0.38)',
  glassBaseFlat: 'rgba(26,20,58,0.6)',
  glassHighlight:'rgba(255,255,255,0.38)',
  glassSheenTop: 0.16,
  blurTint:      'dark',
  glassBtnFill:  'rgba(255,255,255,0.05)',
};

// ── LIGHT (soft frosted white, big radii, airy — after the reference design) ──
const LIGHT = {
  isDark: false,

  bg:       '#ecebf3',
  surface:  '#f6f5fa',
  card:     '#ffffff',
  card2:    '#f3f1fa',
  border:   'rgba(60,40,110,0.10)',
  border2:  'rgba(60,40,110,0.20)',

  p600: '#5b21b6',
  p500: '#6d28d9',
  p400: '#7c3aed',
  p300: '#6d28d9',
  p200: '#5b21b6',
  p100: '#3b0764',

  gold:  '#b7791f',
  gold2: '#a86a0a',
  gold3: '#9a6408',
  gold4: '#7c4f06',

  text:   '#1b1530',
  muted:  '#4e4575',
  dim:    '#756c91',

  green: '#15803d',
  amber: '#b45309',
  blue:  '#2563eb',
  red:   '#dc2626',
  ok:    '#15803d',
  purple:'#7c3aed',

  hero:        '#e7e0fb',
  heroScrim:   'rgba(231,224,251,0.80)',
  heroShape:   { overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  cardStrong:  '#ffffff',
  sheet:       '#f7f6fb',
  tabBar:      'rgba(255,255,255,0.94)',
  fillSoft:    'rgba(60,40,110,0.05)',

  onHero:      '#1b1530',
  onHeroSub:   '#4e4575',
  soft:        '#4a4166',
  textGlow:    'rgba(168,106,10,0.28)',
  textShadow:  'rgba(0,0,0,0)',

  // soft, diffuse lift for opaque white cards
  shadow: {
    shadowColor: '#3c286e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 14, elevation: 3,
  },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1, borderColor: 'rgba(168,106,10,0.40)', borderTopColor: 'rgba(255,255,255,1)',
    borderRadius: 30, paddingHorizontal: 12, paddingVertical: 5,
  },
  chipText: { color: '#9a6408', fontSize: 9.5, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  chipPurple: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.35)', borderTopColor: 'rgba(255,255,255,1)',
    borderRadius: 30, paddingHorizontal: 12, paddingVertical: 5,
  },
  chipPurpleText: { color: '#5b21b6', fontSize: 9.5, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },

  glassBase:     'rgba(255,255,255,0.55)',
  glassBaseFlat: 'rgba(255,255,255,0.78)',
  glassHighlight:'rgba(255,255,255,0.95)',
  glassSheenTop: 0.55,
  blurTint:      'light',
  glassBtnFill:  'rgba(255,255,255,0.75)',
};

export const THEMES = { dark: DARK, light: LIGHT };

const RADII = {
  dark:  { sm: 8,  md: 12, lg: 16, xl: 20, pill: 30 },
  light: { sm: 10, md: 16, lg: 22, xl: 28, pill: 30 },
};

// ── active theme (set synchronously by ThemeProvider during render) ──────────
let currentName = 'dark';
export const getThemeName = () => currentName;
export function setThemeName(name) {
  if (THEMES[name]) currentName = name;
}

// A live view of the active palette: `COLORS.text` is read at the moment it is used.
function liveView(pick) {
  return new Proxy({}, {
    get: (_, key) => pick()[key],
    has: (_, key) => key in pick(),
    ownKeys: () => Reflect.ownKeys(pick()),
    getOwnPropertyDescriptor: (_, key) => (
      key in pick() ? { enumerable: true, configurable: true, value: pick()[key] } : undefined
    ),
  });
}

export const COLORS = liveView(() => THEMES[currentName]);
export const RADIUS = liveView(() => RADII[currentName]);

export const FONTS = {
  syne: 'Syne_700Bold',
  syneMed: 'Syne_500Medium',
  dm: 'DMSans_400Regular',
  dmMed: 'DMSans_500Medium',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 32,
};

// Frosted label styles, themed. Spread into a style:  { ...GLASS.chip, marginBottom: 8 }
export const GLASS = {
  get chip()           { return THEMES[currentName].chip; },
  get chipText()       { return THEMES[currentName].chipText; },
  get chipPurple()     { return THEMES[currentName].chipPurple; },
  get chipPurpleText() { return THEMES[currentName].chipPurpleText; },
};

// ── themed(): drop-in for StyleSheet.create that follows the active theme ─────
//   const styles = themed(() => ({ card: { backgroundColor: COLORS.card } }));
// The factory runs once per theme (lazily) and the result is cached.
export function themed(factory) {
  const cache = {};
  const sheet = () => cache[currentName] || (cache[currentName] = StyleSheet.create(factory()));
  return new Proxy({}, {
    get: (_, key) => sheet()[key],
    has: (_, key) => key in sheet(),
    ownKeys: () => Reflect.ownKeys(sheet()),
    getOwnPropertyDescriptor: (_, key) => (
      key in sheet() ? { enumerable: true, configurable: true, value: sheet()[key] } : undefined
    ),
  });
}

// themedValue(): same idea for plain data tables that contain theme colours
// (objects or arrays). Read them at render time, e.g. TAG_STYLES[tag].
export function themedValue(factory) {
  const cache = {};
  const value = () => cache[currentName] || (cache[currentName] = factory());
  const probe = value();
  const isArr = Array.isArray(probe);
  return new Proxy(isArr ? [] : {}, {
    get: (_, key) => {
      const v = value()[key];
      return typeof v === 'function' ? v.bind(value()) : v;
    },
    has: (_, key) => key in value(),
    ownKeys: () => Reflect.ownKeys(value()),
    getOwnPropertyDescriptor: (_, key) => {
      const d = Reflect.getOwnPropertyDescriptor(value(), key);
      if (!d) return undefined;
      return isArr ? d : { ...d, configurable: true };   // arrays: 'length' must stay as-is
    },
  });
}
