'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';

function DownloadInner() {
  const searchParams = useSearchParams();
  const file = searchParams.get('file') ?? '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const apiUrl = `/api/download?file=${encodeURIComponent(file)}`;

  const isIOS = () =>
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const handleDownload = async () => {
    if (status === 'loading') return;

    // iOS 외 환경: 서버 Content-Disposition 헤더가 파일명을 처리(한글 정상)
    if (!isIOS()) {
      const a = document.createElement('a');
      a.href = apiUrl; // download 속성 없음 → 서버 filename* 사용
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatus('done');
      return;
    }

    // iOS: Safari가 PDF를 인라인으로 열어버리므로 Blob으로 받아 강제 다운로드
    setStatus('loading');
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('download failed');
      const blob = await res.blob();
      const forced = new Blob([blob], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(forced);
      const a = document.createElement('a');
      a.href = url;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <svg className="w-16 h-16 mx-auto text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <p className="text-lg font-bold mb-2">파일 다운로드</p>
        <p className="text-sm text-text-secondary mb-6">{file}</p>

        <button
          type="button"
          onClick={handleDownload}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors mb-3 disabled:opacity-60"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {status === 'loading' ? '다운로드 중...' : status === 'done' ? '다시 다운로드' : '다운로드'}
        </button>

        {status === 'done' && (
          <p className="text-sm text-success mb-2">다운로드를 시작했어요. 파일 앱에서 확인하세요.</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-error mb-2">다운로드에 실패했어요. 다시 시도해 주세요.</p>
        )}
      </div>

      <Link
        href="/materials"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary px-6 py-3 rounded-xl font-medium text-base border border-border hover:border-primary/40 transition-colors"
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
        <p className="text-text-secondary">준비 중...</p>
      </div>
    }>
      <DownloadInner />
    </Suspense>
  );
}
