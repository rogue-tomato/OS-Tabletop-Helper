// Image prefetch helpers.
//
// Two concerns: (1) duplicate <link> tags should never accumulate when
// the user navigates around — every fire path looks idempotent to the
// caller, (2) prefetch work shouldn't compete with the initial render
// or the user's first interaction. We expose a small dedup helper plus
// a `requestIdleCallback` wrapper.

type PrefetchRel = 'prefetch' | 'preload';

const fired = new Set<string>();

export function prefetchImageOnce(
  href: string | undefined | null,
  rel: PrefetchRel = 'prefetch',
): HTMLLinkElement | null {
  if (!href) return null;
  if (typeof document === 'undefined') return null;
  const key = `${rel}:${href}`;
  if (fired.has(key)) return null;

  // Belt-and-braces: another path (HTML, external lib) may have already
  // added an equivalent link. CSS.escape covers any unusual chars in
  // hashed filenames.
  const safeHref =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(href)
      : href.replace(/"/g, '\\"');
  const existing = document.head.querySelector(
    `link[rel="${rel}"][href="${safeHref}"]`,
  );
  if (existing) {
    fired.add(key);
    return existing as HTMLLinkElement;
  }

  const link = document.createElement('link');
  link.rel = rel;
  link.as = 'image';
  link.href = href;
  document.head.appendChild(link);
  fired.add(key);
  return link;
}

// Throttled image preloader.
//
// Instantiates real <Image>s so the browser fetches them at normal
// image priority (vs. the low-priority `<link rel="prefetch">` it
// likes to defer). To avoid blasting the network with 200+
// simultaneous requests on home mount — which on slow desktop
// connections froze the whole list — we cap concurrency to 6, the
// HTTP/1.1 per-origin connection limit. Items beyond the cap wait
// in a FIFO queue and start as earlier loads finish.
const inFlight = new Set<HTMLImageElement>();
const loaded = new Set<string>();
const queue: string[] = [];
let active = 0;
const MAX_CONCURRENT = 6;

function pump() {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const href = queue.shift() as string;
    active += 1;
    const img = new Image();
    inFlight.add(img);
    const release = () => {
      inFlight.delete(img);
      active -= 1;
      pump();
    };
    img.onload = release;
    img.onerror = release;
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority =
      'high';
    img.decoding = 'async';
    img.src = href;
  }
}

export function preloadImageEager(href: string | undefined | null): void {
  if (!href) return;
  if (typeof Image === 'undefined') return;
  if (loaded.has(href)) return;
  loaded.add(href);
  queue.push(href);
  pump();
}

type IdleHandle = { cancel: () => void };

// Defers work until the browser is idle. Falls back to a small
// `setTimeout` on browsers without `requestIdleCallback` (Safari
// historically). The returned cancel function makes it safe to call
// from a `useEffect` that may unmount before the callback fires.
export function scheduleIdle(
  callback: () => void,
  timeout = 2000,
): IdleHandle {
  if (typeof window === 'undefined') {
    return { cancel: () => {} };
  }
  const ric = (
    window as Window &
      typeof globalThis & {
        requestIdleCallback?: (
          cb: () => void,
          options?: { timeout?: number },
        ) => number;
        cancelIdleCallback?: (handle: number) => void;
      }
  ).requestIdleCallback;
  if (typeof ric === 'function') {
    const handle = ric(callback, { timeout });
    return {
      cancel: () => {
        const cic = (
          window as Window &
            typeof globalThis & {
              cancelIdleCallback?: (handle: number) => void;
            }
        ).cancelIdleCallback;
        cic?.(handle);
      },
    };
  }
  const handle = window.setTimeout(callback, 200);
  return { cancel: () => window.clearTimeout(handle) };
}
