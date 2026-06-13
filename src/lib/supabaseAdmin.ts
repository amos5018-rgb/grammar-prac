import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 서버 전용 Supabase 클라이언트 (service-role 키 사용 → RLS 우회).
// 'server-only' import로 클라이언트 번들에 포함되면 빌드 에러가 나도록 방지.

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null; // 환경변수 미설정 시 null (동기화는 조용히 비활성)
  if (cached) return cached;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
