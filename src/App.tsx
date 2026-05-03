import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CharacterPage } from './pages/CharacterPage';

export default function App() {
  // The fixed backdrop's pixel dimensions are pinned to `screen.width`
  // / `screen.height` rather than `100lvh` / `100vw`. iOS Safari
  // resolves CSS viewport units against the visual viewport when the
  // on-screen keyboard appears and shrinks the bg accordingly; using
  // a stable physical-screen size means the keyboard can't touch it.
  const bgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    const apply = () => {
      // Some Android WebViews report 0 for screen dims briefly —
      // fall back to innerWidth/Height in that case.
      const w = window.screen?.width || window.innerWidth;
      const h = window.screen?.height || window.innerHeight;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
    };
    apply();
    // Re-apply after orientation flip — screen.width / .height swap.
    const onOrient = () => window.setTimeout(apply, 150);
    window.addEventListener('orientationchange', onOrient);
    return () => window.removeEventListener('orientationchange', onOrient);
  }, []);

  return (
    <>
      {/* Full-viewport fixed backdrop. Sized in JS via useEffect. */}
      <div ref={bgRef} className="app-bg" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/character/:slug" element={<CharacterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
