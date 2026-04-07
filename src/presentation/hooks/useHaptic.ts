import { useCallback } from 'react';

/**
 * Returns a stable `vibrate` function that calls the Web Vibration API
 * when available (Android Chrome/Firefox). Silent no-op on iOS and desktop.
 */
export function useHaptic() {
  return useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);
}
