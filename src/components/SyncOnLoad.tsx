'use client';

import { useEffect } from 'react';
import { getProfile } from '@/lib/storage';
import { syncNow, hasPendingSync } from '@/lib/sync';

// 화면에 아무것도 렌더링하지 않는 동기화 트리거.
// - 앱 로드 시 프로필이 있으면 1회 동기화
// - 온라인 복귀 시 보류된 동기화 플러시
export default function SyncOnLoad() {
  useEffect(() => {
    if (getProfile()) {
      void syncNow();
    }
    const onOnline = () => {
      if (hasPendingSync() && getProfile()) void syncNow();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return null;
}
