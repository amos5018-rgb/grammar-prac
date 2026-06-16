import { fetchUnits } from '@/lib/sheets';
import ResultContent from './ResultContent';

export const revalidate = 3600;

export async function generateStaticParams() {
  const units = await fetchUnits();
  return units.map(u => ({ code: u.code }));
}

export default async function ResultPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <ResultContent code={code} />;
}
