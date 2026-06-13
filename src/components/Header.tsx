'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfile } from '@/lib/storage';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const pathname = usePathname();
  const [name, setName] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const profile = getProfile();
    if (profile) setName(profile.name);
  }, [pathname]);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="h-12 flex items-center justify-between">
          <Link href="/" className="font-bold text-primary text-lg">
            오남고 1학년 국어: 문법 연습&#128218;
          </Link>
          <div className="flex items-center gap-2">
            {name && (
              <span className="text-sm text-text-secondary">{name}</span>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
