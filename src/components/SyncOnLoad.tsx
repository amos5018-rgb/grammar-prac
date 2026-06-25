'use client';

import { useEffect } from 'react';
import { getProfile, flushSync } from '@/lib/storage';
import { syncNow, hasPendingSync } from '@/lib/sync';

// 화면에 아무것도 렌더링하지 않는 동기화 트리거.
// - 앱 로드 시 프로필이 있으면 1회 동기화 (이전 세션 미전송분 catch-all)
// - 온라인 복귀 시 보류된 동기화 플러시
// - 탭 이탈/종료 시 디바운스 대기분 즉시 flush (무손실)
export default function SyncOnLoad() {
  useEffect(() => {
    if (getProfile()) {
      void syncNow();
    }
    const onOnline = () => {
      if (hasPendingSync() && getProfile()) void syncNow();
    };
    const onLeave = () => {
      if (getProfile()) flushSync();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') onLeave();
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('pagehide', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pagehide', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
