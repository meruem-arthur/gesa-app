// Tiny bridge between a tapped push notification (App.js) and the screen switcher
// (AppLayout in AppNavigator.js). The tap can arrive before AppLayout has mounted
// (cold start), so the requested screen is held until a listener picks it up.

// Must match the screen names in AppNavigator (MAIN_TABS + SIDEBAR_ITEMS).
export const NOTIFY_SCREENS = [
  'Home', 'Timetable', 'Materials', 'PastQ', 'Events', 'Notice', 'Exams', 'Business',
];

let pending = null;
let listener = null;

export function requestScreen(name) {
  if (typeof name !== 'string' || !NOTIFY_SCREENS.includes(name)) return;
  if (listener) listener(name);
  else pending = name;
}

// Returns an unsubscribe function. Delivers any screen requested before mount.
export function subscribeToScreenRequests(fn) {
  listener = fn;
  if (pending) {
    const name = pending;
    pending = null;
    fn(name);
  }
  return () => { if (listener === fn) listener = null; };
}
