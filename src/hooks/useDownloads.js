import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const STORAGE_KEY = 'gesa_downloads';

// ─── MIME type from file extension ────────────────────────────────────────────
function getMimeType(fileName) {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'pdf':  return 'application/pdf';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':  return 'application/msword';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'ppt':  return 'application/vnd.ms-powerpoint';
    default:     return 'application/octet-stream';
  }
}

// ─── Ensure the filename has a valid document extension ───────────────────────
function ensureDocExtension(name, fallbackExt = 'pdf') {
  if (/\.(pdf|docx|doc|pptx|ppt)$/i.test(name)) return name;
  return `${name}.${fallbackExt}`;
}

export function useDownloads() {
  const [downloaded, setDownloaded] = useState({}); // { [url]: localPath }
  const [downloading, setDownloading] = useState({}); // { [id]: progress 0-1 }

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const map = JSON.parse(raw);
          const verified = {};
          for (const [url, localPath] of Object.entries(map)) {
            const info = await FileSystem.getInfoAsync(localPath);
            if (info.exists) verified[url] = localPath;
          }
          setDownloaded(verified);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(verified));
        }
      } catch (e) {
        console.warn('useDownloads: failed to load', e);
      }
    })();
  }, []);

  const persist = async (map) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn('useDownloads: failed to persist', e);
    }
  };

  const getFileName = (url, fallback = 'file') => {
    try {
      const clean = url.split('?')[0];
      const parts = clean.split('/');
      const last = decodeURIComponent(parts[parts.length - 1] || fallback);
      return ensureDocExtension(last);
    } catch {
      return ensureDocExtension(fallback);
    }
  };

  const openLocalFile = async (localPath) => {
    if (Platform.OS === 'android') {
      const cUri = await FileSystem.getContentUriAsync(localPath);
      const mimeType = getMimeType(localPath);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: cUri,
        type: mimeType,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      });
    } else {
      const { openURL } = require('react-native').Linking;
      await openURL(localPath);
    }
  };

  const download = useCallback(async (id, url, fileName) => {
    if (downloading[id]) return;
    setDownloading((prev) => ({ ...prev, [id]: 0 }));

    try {
      // Use saved fileName first, then extract from URL
      const resolvedName = fileName
        ? ensureDocExtension(fileName)
        : getFileName(url, `${id}.pdf`);
      const localPath = `${FileSystem.documentDirectory}${resolvedName}`;

      // Cloudinary raw files (docx, pptx) need fl_attachment to force direct download
      // Insert it into the Cloudinary URL before the filename segment
      let downloadUrl = url;
      if (/res\.cloudinary\.com/.test(url) && /\/raw\/upload\//.test(url)) {
        downloadUrl = url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
      }

      const callback = (progressEvent) => {
        const progress =
          progressEvent.totalBytesWritten / progressEvent.totalBytesExpectedToWrite;
        setDownloading((prev) => ({ ...prev, [id]: progress }));
      };

      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        localPath,
        {},
        callback
      );

      const result = await downloadResumable.downloadAsync();

      const updated = { ...downloaded, [url]: result.uri };
      setDownloaded(updated);
      await persist(updated);
    } catch (e) {
      console.warn('useDownloads: download failed', e);
      Alert.alert('Download failed', 'Could not download this file. Please try again.');
    } finally {
      setDownloading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }, [downloading, downloaded]);

  const openItem = useCallback(async (url) => {
    const localPath = downloaded[url];
    if (localPath) {
      try {
        const info = await FileSystem.getInfoAsync(localPath);
        if (info.exists) {
          await openLocalFile(localPath);
          return;
        }
        // File was in AsyncStorage but deleted from disk — clean it up
        const updated = { ...downloaded };
        delete updated[url];
        setDownloaded(updated);
        await persist(updated);
      } catch (e) {
        console.warn('useDownloads: failed to open local file', e);
        // If it's a docx/pptx, hint the user they need an app
        const ext = (localPath.split('.').pop() || '').toLowerCase();
        if (ext === 'docx' || ext === 'pptx' || ext === 'doc' || ext === 'ppt') {
          Alert.alert(
            'App required',
            'To open this file, you need Microsoft Word, PowerPoint, Google Docs, or WPS Office installed on your device.'
          );
          return;
        }
      }
    }
    // Not downloaded yet — prompt the user
    Alert.alert('Not downloaded', 'Tap the download button first to save this file for offline access.');
  }, [downloaded]);

  return { downloaded, downloading, download, openItem };
}
