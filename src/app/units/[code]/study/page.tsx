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

  return <StudyReview unitCode={code} cards={cards} />;
}
