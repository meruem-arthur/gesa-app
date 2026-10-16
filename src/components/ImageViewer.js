import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, Modal, TouchableOpacity, TouchableWithoutFeedback,
  ActivityIndicator, Dimensions, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Full-screen photo viewer.
//   <ImageViewer visible={!!photo} uri={photo?.uri} title="Name" subtitle="Role" onClose={() => setPhoto(null)} />
// Tap anywhere, press the ✕, or use the Android back button to close.
// Always dark (a photo looks best on black), whichever app theme is active.
export default function ImageViewer({ visible, uri, title, subtitle, onClose }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed]   = useState(false);

  // reset each time a different photo opens
  useEffect(() => { if (visible) { setLoading(true); setFailed(false); } }, [visible, uri]);

  const { width, height } = Dimensions.get('window');
  const boxW = width - 24;
  const boxH = Math.round(height * 0.68);

  return (
    <Modal
      visible={!!visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop}>
          <TouchableOpacity
            style={[s.close, { top: insets.top + 10 }]}
            onPress={onClose}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Close photo"
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={{ width: boxW, height: boxH, alignItems: 'center', justifyContent: 'center' }}>
            {!!uri && !failed && (
              <Image
                source={{ uri }}
                style={{ width: boxW, height: boxH }}
                resizeMode="contain"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => { setFailed(true); setLoading(false); }}
              />
            )}
            {loading && !failed && <ActivityIndicator style={StyleSheet.absoluteFill} color="#e8b82a" size="large" />}
            {failed && (
              <View style={s.failBox}>
                <Ionicons name="image-outline" size={36} color="rgba(255,255,255,0.55)" />
                <Text style={s.failTx}>Couldn't load this photo</Text>
              </View>
            )}
          </View>

          {(!!title || !!subtitle) && (
            <View style={[s.caption, { bottom: Math.max(insets.bottom, 12) + 18 }]}>
              {!!title    && <Text style={s.title} numberOfLines={2}>{title}</Text>}
              {!!subtitle && <Text style={s.sub} numberOfLines={2}>{subtitle}</Text>}
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5,3,12,0.94)', alignItems: 'center', justifyContent: 'center' },
  close: {
    position: 'absolute', right: 16, zIndex: 5, width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  failBox: { alignItems: 'center', gap: 8 },
  failTx:  { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  caption: { position: 'absolute', left: 24, right: 24, alignItems: 'center', gap: 3 },
  title:   { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  sub:     { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center' },
});
