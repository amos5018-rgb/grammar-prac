import Link from 'next/link';
import { Unit } from '@/lib/types';

interface UnitCardProps {
  unit: Unit;
  questionCount: number;
  bestScore: number | null;
  attempts: number;
}

export default function UnitCard({ unit, questionCount, bestScore, attempts }: UnitCardProps) {
  return (
    <Link
      href={`/units/${unit.code}`}
      className="block bg-surface rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98]"
    >
      <h3 className="font-bold text-lg mb-1">{unit.name}</h3>
      <p className="text-text-secondary text-sm mb-4 line-clamp-2">{unit.description}</p>
      <div className="flex items-center gap-3 text-xs">
        <span className="bg-primary-light text-primary px-2.5 py-1 rounded-full font-medium">
          {questionCount}문제
        </span>
        {bestScore !== null && (
          <span className={`px-2.5 py-1 rounded-full font-medium ${
            bestScore >= 80 ? 'bg-success-light text-success' :
            bestScore >= 50 ? 'bg-warning-light text-warning' :
            'bg-error-light text-error'
          }`}>
            최고 {bestScore}점
          </span>
        )}
        {attempts > 0 && (
          <span className="text-text-secondary">{attempts}회 풀이</span>
        )}
      </div>
    </Link>
  );
}
