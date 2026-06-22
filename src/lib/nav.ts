// 화면 간 '진입 경로(from)' 전파 헬퍼.
// 총정리 모음(/summary)에서 단원에 들어간 경우, 학습 후 '단원 목록' 복귀 위치를
// /summary로 되돌리기 위해 from 값을 링크에 이어 붙인다.

export function withFrom(href: string, from: string | null | undefined): string {
  if (!from) return href;
  const sep = href.includes('?') ? '&' : '?';
  return `${href}${sep}from=${encodeURIComponent(from)}`;
}

// '단원 목록' 복귀 경로: summary에서 왔으면 /summary, 아니면 카테고리 페이지.
export function unitListHref(from: string | null | undefined, category: string): string {
  return from === 'summary' ? '/summary' : `/category/${category}`;
}
