import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  children: ReactNode;
  showBack?: boolean;
  title?: string;
};

export function Layout({ children, showBack, title }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-ink-950/85 border-b border-ember-700/20">
        <div className="mx-auto max-w-screen-md px-4 py-3 flex items-center gap-3">
          {showBack ? (
            <Link
              to="/"
              className="tap-target -ml-2 inline-flex items-center justify-center px-2 rounded-lg text-ember-400 hover:text-ember-500 active:scale-95 transition"
              aria-label="Back to character list"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
          ) : null}
          <h1 className="font-display text-lg sm:text-xl text-ember-400 tracking-widest uppercase">
            {title ?? 'Oathsworn'}
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-screen-md w-full px-4 py-4 flex-1 safe-bottom">
        {children}
      </main>
    </div>
  );
}
