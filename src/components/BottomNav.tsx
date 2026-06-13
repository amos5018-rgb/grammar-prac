'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '단원 목록', icon: BookIcon },
  { href: '/review', label: '오답 노트', icon: ClipboardIcon },
  { href: '/progress', label: '학습 기록', icon: ChartIcon },
  { href: '/materials', label: '학습 자료', icon: FileIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname.startsWith('/category') || pathname.startsWith('/units');
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-3xl mx-auto flex px-2">
        {navItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1.5 pt-3 pb-6 text-[11px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <item.icon className="w-6 h-6" active={active} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function BookIcon({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function ClipboardIcon({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function ChartIcon({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function FileIcon({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
