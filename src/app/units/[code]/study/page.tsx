import { Suspense } from 'react';
import { fetchUnits, fetchStudyCards } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import StudyReview from '@/components/StudyReview';

// 복습 카드는 fetchStudyCards()(로컬 전용, Google Sheets 미연동)만 사용 → 재배포 시에만 변경.
// 완전 정적으로 처리해 ISR 재생성을 제거한다.
export const revalidate = false;

export async function generateStaticParams() {
  const units = await fetchUnits();
  return units.filter(u => u.study).map(u => ({ code: u.code }));
}

export default async function StudyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cards = fetchStudyCards(code);

  if (cards.length === 0) notFound();

  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-center"><p className="text-text-secondary">불러오는 중...</p></div>}>
      <StudyReview unitCode={code} cards={cards} />
    </Suspense>
  );
}
