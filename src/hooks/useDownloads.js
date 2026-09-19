import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const STORAGE_KEY = 'gesa_downloads';

// Only the file NAME is saved, not the full path. iOS moves the app's documents
// folder when the app is updated/restored, so a saved absolute path stops
// resolving and the file looks "not downloaded" even though it is still there.
// Old entries (absolute paths) are normalised to just the name on load.
const toName = (p) => String(p).split('/').pop();
const resolvePath = (name) => `${FileSystem.documentDirectory}${name}`;

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
          for (const [url, stored] of Object.entries(map)) {
            const localPath = resolvePath(toName(stored));
            const info = await FileSystem.getInfoAsync(localPath);
            if (info.exists) verified[url] = localPath;
          }
          setDownloaded(verified);
          await persist(verified); // also rewrites old absolute paths as names
        }
      } catch (e) {
        console.warn('useDownloads: failed to load', e);
      }
    })();
  }, []);

  const persist = async (map) => {
    try {
      const names = {};
      for (const [url, localPath] of Object.entries(map)) names[url] = toName(localPath);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    } catch (e) {
      console.warn('useDownloads: failed to persist', e);
    }
  };

  // Materials and Past Questions each have their own copy of this hook. Merge into
  // what's stored instead of writing our (possibly stale) in-memory map, otherwise
  // a download made on one screen can be erased by a download made on the other.
  const saveEntry = async (url, localPath) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : {};
      stored[url] = toName(localPath);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      console.warn('useDownloads: failed to save entry', e);
    }
  };

  const removeEntry = async (url) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : {};
      delete stored[url];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      console.warn('useDownloads: failed to remove entry', e);
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
      try {
        const cUri = await FileSystem.getContentUriAsync(localPath);
        const mimeType = getMimeType(localPath);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: cUri,
          type: mimeType,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        });
      } catch (e) {
        // IntentLauncher can fail on some Android versions/devices
        // (no app registered for the VIEW intent, permission quirks, etc.)
        // Fall back to the native share sheet, which can always open the file.
        console.warn('useDownloads: IntentLauncher failed, falling back to sharing', e);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(localPath, { mimeType: getMimeType(localPath) });
        } else {
          throw e;
        }
      }
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

      setDownloaded((prev) => ({ ...prev, [url]: result.uri }));
      await saveEntry(url, result.uri);
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
  }, [downloading]);

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
        setDownloaded((prev) => {
          const next = { ...prev };
          delete next[url];
          return next;
        });
        await removeEntry(url);
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
