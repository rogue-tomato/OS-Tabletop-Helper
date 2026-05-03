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
  `url(${import.meta.env.BASE_URL}forest-bg.webp)`,
);

// HashRouter doesn't manage scroll, and the browser default ('auto')
// fights with our manual restore on the home page. Take full control.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
