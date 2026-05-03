import { useEffect, useState } from 'react';

// Fixed-position overlay button that returns the page to the top when
// tapped. Appears once the user has scrolled past a small threshold so
// it doesn't clutter the first viewport.
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed bottom-5 right-5 z-40 w-11 h-11 inline-flex items-center justify-center bg-ink-900/90 border border-accent/60 text-accent shadow-lg backdrop-blur-md active:scale-95 transition hover:bg-ink-800/90"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M6 14l6-6 6 6" />
      </svg>
    </button>
  );
}
