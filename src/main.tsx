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
    tg.setHeaderColor?.('#08060a');
    tg.setBackgroundColor?.('#08060a');
  } catch {
    // Non-Telegram environment — ignore.
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
