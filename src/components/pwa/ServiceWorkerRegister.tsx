'use client';

import { useEffect } from 'react';

/** Registers the offline-shell service worker (production only, so it never interferes with `next dev`). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.warn('Service worker registration failed', error);
    });
  }, []);

  return null;
}
