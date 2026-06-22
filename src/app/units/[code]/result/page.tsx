import { Suspense } from 'react';
import { fetchUnits } from '@/lib/sheets';
import ResultContent from './ResultContent';

export const revalidate = 3600;

export async function generateStaticParams() {
  const units = await fetchUnits();
  return units.map(u => ({ code: u.code }));
}

export default async function ResultPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-center"><p className="text-text-secondary">불러오는 중...</p></div>}>
      <ResultContent code={code} />
    </Suspense>
  );
}
