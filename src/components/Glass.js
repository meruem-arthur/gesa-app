import React, { useEffect, useRef, useState, useId } from 'react';
import {
  View, Text, TouchableOpacity, Animated, Easing, StyleSheet, Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, themed } from '../constants/theme';

// "#e8b82a", 0.3  →  "rgba(232,184,42,0.3)"
export function rgba(hex, a) {
  const h = String(hex).replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// Android quirk: a react-native-svg element sized "100%" can be measured before its parent
// has its final size and then never grow, leaving the colour covering only the top-left.
// SvgFill measures the parent itself (onLayout) and draws at exact pixel size, so the
// colour always covers the whole surface. render(w, h) returns the <Defs>/<Rect> children.
export function SvgFill({ render, style }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = e => {
    const { width, height } = e.nativeEvent.layout;
    setBox(p => (Math.abs(p.w - width) < 0.5 && Math.abs(p.h - height) < 0.5 ? p : { w: width, h: height }));
  };
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]} onLayout={onLayout}>
      {box.w > 0 && box.h > 0 && (
        <Svg width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`}>
          {render(box.w, box.h)}
        </Svg>
      )}
    </View>
  );
}

// Unique, url()-safe gradient id (a shared id lets one gradient hijack another).
function useGradId(prefix) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

// Diagonal "light catching glass" sheen: bright white corner → tint → tint.
function Sheen({ tint, strength }) {
  const id = useGradId('sheen');
  return (
    <SvgFill
      render={(w, h) => (
        <>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0"    stopColor="#ffffff" stopOpacity={Math.min(0.6, COLORS.glassSheenTop * strength)} />
              <Stop offset="0.45" stopColor={tint}    stopOpacity={Math.min(0.5, 0.07 * strength)} />
              <Stop offset="1"    stopColor={tint}    stopOpacity={Math.min(0.6, 0.14 * strength)} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={w} height={h} fill={`url(#${id})`} />
        </>
      )}
    />
  );
}

// HUD-style corner brackets (top-left + bottom-right).
function Corners({ color }) {
  const base = { position: 'absolute', width: 14, height: 14, borderColor: color };
  return (
    <>
      <View pointerEvents="none" style={[base, { top: 7, left: 7, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderTopLeftRadius: 4 }]} />
      <View pointerEvents="none" style={[base, { bottom: 7, right: 7, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderBottomRightRadius: 4 }]} />
    </>
  );
}

/**
 * Frosted-glass surface.
 *  tint      hex colour of the glass edge + glow
 *  strength  how strongly the tint shows (1 = subtle, 2+ = vivid)
 *  blur      draw a BlurView (set false on flat dark backgrounds, where there is nothing to blur)
 *  realBlur  Android only: ask for a true blur. It costs GPU, so use it sparingly
 *            (otherwise Android shows a translucent tint, which still looks like glass).
 *  corners   add HUD corner brackets
 */
export function GlassCard({
  children, style, tint = '#e8b82a', strength = 1, radius = RADIUS.xl,
  intensity = 30, blur = true, realBlur = false, corners = false, edge = 0.3,
}) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: rgba(tint, edge),
          backgroundColor: blur ? COLORS.glassBase : COLORS.glassBaseFlat,
        },
        style,
      ]}
    >
      {blur && (
        <BlurView
          intensity={intensity}
          tint={COLORS.blurTint}
          experimentalBlurMethod={realBlur && Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Sheen tint={tint} strength={strength} />
      {/* thin specular highlight along the top edge */}
      <View pointerEvents="none" style={[g.topEdge, { left: radius * 0.6, right: radius * 0.6 }]} />
      {corners && <Corners color={rgba(tint, 0.85)} />}
      {children}
    </View>
  );
}

// Slowly pulsing status dot (used in the Word of the Day label).
export function PulseDot({ color = COLORS.gold2, size = 6 }) {
  const o = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(o, { toValue: 0.25, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(o, { toValue: 1,    duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [o]);
  return (
    <Animated.View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: o }}
    />
  );
}

// Horizontal hairline that fades out to the right.
export function FadeLine({ color, style }) {
  color = color || COLORS.gold2;
  const id = useGradId('fade');
  return (
    <View style={[{ height: 1 }, style]}>
      <SvgFill
        render={(w, h) => (
          <>
            <Defs>
              <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={color} stopOpacity="0.55" />
                <Stop offset="1" stopColor={color} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={w} height={h} fill={`url(#${id})`} />
          </>
        )}
      />
    </View>
  );
}

/**
 * Button.
 *  variant "primary" → glowing gold gradient (main action)
 *  variant "glass"   → frosted outline (secondary actions)
 */
export function GlassButton({
  label, icon, iconColor, onPress, variant = 'glass', tint = '#e8b82a', style, textStyle,
}) {
  const primary = variant === 'primary';
  const goldId = useGradId('btngold');
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[primary && g.primaryShadow, { borderRadius: RADIUS.md }, style]}
    >
      <View
        style={[
          g.btnInner,
          primary
            ? { borderColor: 'rgba(255,255,255,0.45)' }
            : { borderColor: rgba(tint, 0.45), backgroundColor: COLORS.glassBtnFill },
        ]}
      >
        {primary ? (
          <SvgFill
            render={(w, h) => (
              <>
                <Defs>
                  <LinearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#fde68a" />
                    <Stop offset="0.55" stopColor="#e8b82a" />
                    <Stop offset="1" stopColor="#c8920f" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width={w} height={h} fill={`url(#${goldId})`} />
              </>
            )}
          />
        ) : (
          <View pointerEvents="none" style={[g.topEdge, { left: 10, right: 10 }]} />
        )}
        {!!icon && <Ionicons name={icon} size={16} color={iconColor || (primary ? '#1a1200' : COLORS.gold2)} />}
        <Text style={[g.btnTx, primary ? { color: '#1a1200' } : { color: COLORS.text }, textStyle]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const g = themed(() => ({
  topEdge: { position: 'absolute', top: 0, height: 1, backgroundColor: COLORS.glassHighlight },
  primaryShadow: {
    shadowColor: '#e8b82a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.55, shadowRadius: 10, elevation: 8,
  },
  btnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingHorizontal: SPACING.lg, paddingVertical: 11,
    borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden',
  },
  btnTx: { fontSize: 13, fontWeight: '700', letterSpacing: 0.4 },
}));
