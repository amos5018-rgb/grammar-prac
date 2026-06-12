import { fetchUnits, fetchStudyCards } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import StudyReview from '@/components/StudyReview';

export const revalidate = 300;

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
