import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocs, Timestamp } from 'firebase/firestore';

// ─── Offline cache ────────────────────────────────────────────────────────────
// Every Firestore read goes through useCachedQuery:
//   1. show the saved copy straight away (works with data off, after a restart)
//   2. try the network in the background
//   3. if it succeeds, swap in the fresh data and save it for next time
//   4. if it fails, keep showing the saved copy and flag `offline`
// Pull-to-refresh calls `refresh()`, which repeats steps 2-4.
//
// Firestore's own persistentLocalCache is IndexedDB based, which React Native
// doesn't have, so it can't be relied on across app restarts — hence AsyncStorage.

const PREFIX = 'gesa_cache:v1:';
const NETWORK_TIMEOUT_MS = 15000;

// Firestore Timestamps lose their methods when JSON-stringified. Tag them on
// the way out and rebuild them on the way in so screens can keep calling
// `.toDate()` on cached data exactly like on fresh data.
function replacer(key, value) {
  const raw = this[key];
  if (raw instanceof Timestamp) return { __ts: [raw.seconds, raw.nanoseconds] };
  return value;
}
function reviver(_key, value) {
  if (value && typeof value === 'object' && Array.isArray(value.__ts)) {
    return new Timestamp(value.__ts[0], value.__ts[1]);
  }
  return value;
}

export async function readCache(key) {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw, reviver) : null; // { savedAt, data }
  } catch (e) {
    console.warn('cache read failed', key, e);
    return null;
  }
}

async function writeCache(key, data) {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), data }, replacer));
  } catch (e) {
    console.warn('cache write failed', key, e);
  }
}

// Runs a Firestore query and reports whether the answer really came from the
// server. When the device is offline getDocs does NOT throw — it resolves with
// whatever is in Firestore's in-memory cache (often nothing) and marks it
// `fromCache`. Without checking that, an offline refresh would look like "the
// server says there are no materials" and wipe the saved copy.
export async function fetchDocs(q) {
  const snap = await getDocs(q);
  return {
    data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    fromCache: snap.metadata.fromCache,
  };
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Network timeout')), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

const isEmpty = (v) => (Array.isArray(v) ? v.length === 0 : v == null);
const OFFLINE_MSG = "You're offline and nothing is saved on this phone for this yet. Turn on data once to load it.";

/**
 * @param {string} key      unique cache key, include any filters (e.g. `timetable:100:2`)
 * @param {() => Promise<{data: any, fromCache: boolean}>} fetcher  usually built on fetchDocs()
 * @param {any} initial     value before anything loads ([] for lists, null for a single doc)
 */
export function useCachedQuery(key, fetcher, initial = []) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);       // true only while there is nothing to show yet
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh spinner
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);       // last network attempt failed → showing saved copy
  const [savedAt, setSavedAt] = useState(null);        // when the copy on screen was last fetched

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const keyRef = useRef(key);
  keyRef.current = key;
  const hasData = useRef(false);

  const load = useCallback(async (k) => {
    try {
      const { data: fresh, fromCache } = await withTimeout(fetcherRef.current(), NETWORK_TIMEOUT_MS);
      if (keyRef.current !== k) return; // user switched level/semester meanwhile

      if (fromCache) {
        // Couldn't reach the server. Never overwrite a saved copy with this.
        setOffline(true);
        if (!hasData.current) {
          if (isEmpty(fresh)) setError(OFFLINE_MSG);
          else { setData(fresh); hasData.current = true; }
        }
        return;
      }

      setData(fresh);
      setError(null);
      setOffline(false);
      setSavedAt(Date.now());
      hasData.current = true;
      await writeCache(k, fresh);
    } catch (e) {
      if (keyRef.current !== k) return;
      setOffline(true);
      if (!hasData.current) setError(OFFLINE_MSG);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setOffline(false);
      hasData.current = false;

      const cached = await readCache(key);
      if (cancelled) return;
      if (cached) {
        hasData.current = true;
        setData(cached.data);
        setSavedAt(cached.savedAt);
        setLoading(false); // saved copy is on screen; the network check happens quietly behind it
      } else {
        setData(initial);
        setSavedAt(null);
      }

      await load(key);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(keyRef.current); } finally { setRefreshing(false); }
  }, [load]);

  return { data, loading, refreshing, error, offline, savedAt, refresh };
}
