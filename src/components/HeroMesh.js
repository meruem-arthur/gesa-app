import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { COLORS } from '../constants/theme';

// Soft, blurred "mesh gradient" glow that sits behind a screen header
// (absolute-fills its parent; the header's content is drawn on top of it).
const BLOBS = {
  dark: [
    { cx: '12%',  cy: '18%',  rx: '62%', ry: '90%',  c: '#7c3aed', o: 0.55 },
    { cx: '96%',  cy: '8%',   rx: '55%', ry: '80%',  c: '#d4a017', o: 0.26 },
    { cx: '70%',  cy: '112%', rx: '70%', ry: '90%',  c: '#a855f7', o: 0.30 },
  ],
  light: [
    { cx: '8%',   cy: '10%',  rx: '65%', ry: '95%',  c: '#fb923c', o: 0.50 },
    { cx: '98%',  cy: '0%',   rx: '60%', ry: '90%',  c: '#f472b6', o: 0.36 },
    { cx: '62%',  cy: '115%', rx: '75%', ry: '95%',  c: '#a78bfa', o: 0.55 },
  ],
};

export default function HeroMesh() {
  const key = COLORS.isDark ? 'dark' : 'light';
  const blobs = BLOBS[key];
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        {blobs.map((b, i) => (
          <RadialGradient key={i} id={`mesh-${key}-${i}`} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry}>
            <Stop offset="0" stopColor={b.c} stopOpacity={b.o} />
            <Stop offset="1" stopColor={b.c} stopOpacity="0" />
          </RadialGradient>
        ))}
      </Defs>
      {blobs.map((b, i) => (
        <Rect key={i} x="0" y="0" width="100%" height="100%" fill={`url(#mesh-${key}-${i})`} />
      ))}
    </Svg>
  );
}
