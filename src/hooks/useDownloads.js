import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const STORAGE_KEY = 'gesa_downloads';

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
      // Always ensure the file ends in .pdf so Android knows how to open it
      return last.endsWith('.pdf') ? last : `${last}.pdf`;
    } catch {
      return fallback.endsWith('.pdf') ? fallback : `${fallback}.pdf`;
    }
  };

  const openLocalFile = async (localPath) => {
    if (Platform.OS === 'android') {
      const cUri = await FileSystem.getContentUriAsync(localPath);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: cUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      });
    } else {
      // iOS: expo-file-system URI can be opened directly via Linking
      const { openURL } = require('react-native').Linking;
      await openURL(localPath);
    }
  };

  const download = useCallback(async (id, url, fileName) => {
    if (downloading[id]) return;
    setDownloading((prev) => ({ ...prev, [id]: 0 }));

    try {
      const resolvedName = fileName || getFileName(url, `${id}.pdf`);
      const safeName = resolvedName.endsWith('.pdf') ? resolvedName : `${resolvedName}.pdf`;
      const localPath = `${FileSystem.documentDirectory}${safeName}`;

      const callback = (progressEvent) => {
        const progress =
          progressEvent.totalBytesWritten / progressEvent.totalBytesExpectedToWrite;
        setDownloading((prev) => ({ ...prev, [id]: progress }));
      };

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
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
      }
    }
    // Not downloaded yet — prompt the user
    Alert.alert('Not downloaded', 'Tap the download button first to save this file for offline access.');
  }, [downloaded]);

  return { downloaded, downloading, download, openItem };
}
