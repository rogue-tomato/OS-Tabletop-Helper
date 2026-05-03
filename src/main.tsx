import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void;
        expand?: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
      };
    };
  }
}

const tg = window.Telegram?.WebApp;
if (tg) {
  try {
    tg.ready?.();
    tg.expand?.();
    tg.setHeaderColor?.('#080a09');
    tg.setBackgroundColor?.('#080a09');
  } catch {
    // Non-Telegram environment — ignore.
  }
}

// Inject the forest background URL as a CSS variable so index.css can
// reference it without hardcoding the vite base path. Works for both
// dev (base=/) and GitHub Pages (base=/<repo>/).
document.documentElement.style.setProperty(
  '--forest-bg-url',
  `url(${import.meta.env.BASE_URL}forest-bg.jpg)`,
);

// HashRouter doesn't manage scroll, and the browser default ('auto')
// fights with our manual restore on the home page. Take full control.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Try to pin the page to portrait. The Screen Orientation API is
// honoured only in PWA / fullscreen contexts (Chrome/Android,
// installed PWA on iOS) — regular Mobile Safari ignores it. The
// `<link rel="manifest">` + `orientation: portrait-primary` does the
// rest for installed PWAs. In a normal browser tab there's no way to
// lock orientation, that's a hard OS-level rule.
const sOrient = (
  screen as Screen & {
    orientation?: ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
    };
  }
).orientation;
if (sOrient && typeof sOrient.lock === 'function') {
  sOrient.lock('portrait').catch(() => {
    /* host doesn't allow it — silently degrade */
  });
}

// Service Worker — cache-first for assets, stale-while-revalidate for
// the HTML shell. This is what makes second-and-subsequent loads
// instant (and survives offline once the initial visit has cached
// everything HomePage prefetches). Registered after window.load so it
// doesn't compete with first paint.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Some hosts (Telegram WebApp inside older clients) don't allow
      // SW registration — that's fine, we degrade to no caching.
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
