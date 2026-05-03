import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CharacterPage } from './pages/CharacterPage';

export default function App() {
  // The fixed backdrop is pinned to physical screen dimensions and
  // counter-translated against the Visual Viewport so the on-screen
  // keyboard can't shift or shrink it. iOS Safari does two things
  // when the keyboard pops up:
  //   1. The visual viewport shrinks by the keyboard height.
  //   2. The layout viewport scrolls up so the focused input stays
  //      visible above the keyboard — and `position: fixed` elements
  //      ride along with it, which is what the user perceived as the
  //      bg "jumping up to lay on the keyboard's top edge".
  // We cancel that by setting `transform: translate(offsetLeft,
  // offsetTop)` on the bg, where the offsets come from
  // `window.visualViewport`. The end result: the backdrop never
  // moves, never resizes, regardless of keyboard / URL bar / pinch
  // zoom.
  const bgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    const applySize = () => {
      const w = window.screen?.width || window.innerWidth;
      const h = window.screen?.height || window.innerHeight;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
    };
    applySize();

    const vv = window.visualViewport;
    const syncOffset = () => {
      if (!vv) return;
      const ox = vv.offsetLeft || 0;
      const oy = vv.offsetTop || 0;
      // translate3d hits the GPU compositor so iOS doesn't have to
      // re-rasterise the bg on every scroll event during keyboard
      // animation.
      el.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
    };
    syncOffset();

    const onOrient = () => {
      window.setTimeout(() => {
        applySize();
        syncOffset();
      }, 150);
    };
    window.addEventListener('orientationchange', onOrient);
    if (vv) {
      vv.addEventListener('scroll', syncOffset);
      vv.addEventListener('resize', syncOffset);
    }
    return () => {
      window.removeEventListener('orientationchange', onOrient);
      if (vv) {
        vv.removeEventListener('scroll', syncOffset);
        vv.removeEventListener('resize', syncOffset);
      }
    };
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
