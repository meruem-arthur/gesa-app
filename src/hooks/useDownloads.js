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
      const last = parts[parts.length - 1] || fallback;
      return decodeURIComponent(last);
    } catch {
      return fallback;
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
      const WebBrowser = require('expo-web-browser');
      await WebBrowser.openBrowserAsync(localPath);
    }
  };

  const download = useCallback(async (id, url) => {
    if (downloading[id]) return;
    setDownloading((prev) => ({ ...prev, [id]: 0 }));

    try {
      const fileName = getFileName(url, `${id}.pdf`);
      const localPath = `${FileSystem.documentDirectory}${fileName}`;

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
      } catch (e) {
        console.warn('useDownloads: failed to open local file', e);
      }
    }
    const WebBrowser = require('expo-web-browser');
    await WebBrowser.openBrowserAsync(url);
  }, [downloaded]);

  return { downloaded, downloading, download, openItem };
}
