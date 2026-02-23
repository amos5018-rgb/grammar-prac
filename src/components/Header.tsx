'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfile } from '@/lib/storage';

export default function Header() {
  const pathname = usePathname();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const profile = getProfile();
    if (profile) setName(profile.name);
  }, [pathname]);

  const navItems = [
    { href: '/', label: '단원 목록' },
    { href: '/review', label: '오답 노트' },
    { href: '/progress', label: '학습 진도' },
  ];

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-primary text-lg">
          국어 문법 연습
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-primary-light text-primary'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {name && (
            <span className="ml-2 px-3 py-1.5 text-sm text-text-secondary">
              {name}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
