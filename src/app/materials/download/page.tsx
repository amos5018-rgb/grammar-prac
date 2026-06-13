'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Link from 'next/link';

function DownloadInner() {
  const searchParams = useSearchParams();
  const file = searchParams.get('file') ?? '';

  useEffect(() => {
    if (!file) return;
    const timer = setTimeout(() => {
      window.location.assign(`/api/download?file=${encodeURIComponent(file)}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [file]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <svg className="w-16 h-16 mx-auto text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <p className="text-lg font-bold mb-2">파일 다운로드</p>
        <p className="text-sm text-text-secondary">{file}</p>
      </div>

      <Link
        href="/materials"
        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        학습 자료로 돌아가기
      </Link>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-text-secondary">다운로드 준비 중...</p>
      </div>
    }>
      <DownloadInner />
    </Suspense>
  );
}
