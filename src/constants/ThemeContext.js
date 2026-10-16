import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, setThemeName } from './theme';

const KEY = 'gesa.theme';
const ThemeContext = createContext({
  name: 'dark', isDark: true, colors: THEMES.dark, setTheme: () => {}, toggleTheme: () => {},
});

// Wrap the app once. Any component that calls useTheme() re-renders on a switch,
// and everything below it re-renders with it, picking up the new colours.
export function ThemeProvider({ children }) {
  const [name, setName]   = useState('dark');   // default = the original dark look
  const [ready, setReady] = useState(false);

  // Must happen BEFORE children render, so their lazily-built styles see the right theme.
  setThemeName(name);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then(v => { if (alive && THEMES[v]) setName(v); })
      .catch(() => {})
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  const setTheme = useCallback((next) => {
    if (!THEMES[next]) return;
    setName(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  }, []);
  const toggleTheme = useCallback(() => setTheme(name === 'dark' ? 'light' : 'dark'), [name, setTheme]);

  const value = useMemo(
    () => ({ name, isDark: name === 'dark', colors: THEMES[name], setTheme, toggleTheme }),
    [name, setTheme, toggleTheme],
  );

  if (!ready) return null;   // wait for the saved choice so there is no dark→light flash
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
