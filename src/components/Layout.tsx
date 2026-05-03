import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ScrollToTopButton } from './ScrollToTopButton';

type Props = {
  children: ReactNode;
  showBack?: boolean;
  title?: string;
};

export function Layout({ children, showBack, title }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-ink-950/70 border-b border-ember-700/20">
        <div className="mx-auto max-w-screen-md px-4 flex items-center gap-3 min-h-[60px]">
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
          <h1 className="font-display font-bold text-lg sm:text-xl text-ember-400 tracking-widest uppercase">
            {title ?? 'Oathsworn'}
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-screen-md w-full px-4 pt-4 pb-[max(6rem,env(safe-area-inset-bottom))] flex-1">
        {children}
      </main>
      <ScrollToTopButton />
    </div>
  );
}
