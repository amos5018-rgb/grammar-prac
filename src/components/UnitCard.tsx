import Link from 'next/link';
import { Unit } from '@/lib/types';
import { UnitTier } from '@/lib/storage';

interface UnitCardProps {
  unit: Unit;
  questionCount: number;
  bestScore: number | null;
  attempts: number;
  covered?: number;
  tier?: UnitTier;
}

export default function UnitCard({ unit, questionCount, bestScore, attempts, covered = 0, tier }: UnitCardProps) {
  return (
    <Link
      href={`/units/${unit.code}`}
      className={`block bg-surface rounded-2xl border p-5 hover:shadow-md transition-all active:scale-[0.98] ${
        unit.advanced
          ? 'border-warning/40 hover:border-warning'
          : 'border-border hover:border-primary/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-bold text-lg">{unit.name}</h3>
        {tier?.mastered && (
          <span className="text-sm" title={tier.label}>{tier.emoji}</span>
        )}
      </div>
      <p className="text-text-secondary text-sm mb-4 line-clamp-2">{unit.description}</p>
      <div className="flex items-center gap-3 text-xs flex-wrap">
        {unit.advanced && (
          <span className="bg-warning-light text-warning px-2.5 py-1 rounded-full font-medium">
            고난도
          </span>
        )}
        <span className="bg-primary-light text-primary px-2.5 py-1 rounded-full font-medium">
          {unit.study ? `${questionCount}개 카드` : `${questionCount}문제`}
        </span>
        {!unit.study && bestScore !== null && (
          <span className={`px-2.5 py-1 rounded-full font-medium ${
            bestScore >= 80 ? 'bg-success-light text-success' :
            bestScore >= 50 ? 'bg-warning-light text-warning' :
            'bg-error-light text-error'
          }`}>
            최고 {bestScore}점
          </span>
        )}
        {!unit.study && covered > 0 && (
          <span className="bg-success-light text-success px-2.5 py-1 rounded-full font-medium">
            진행 {covered}/{questionCount}
          </span>
        )}
        {!unit.study && attempts > 0 && (
          <span className="text-text-secondary">{attempts}회 풀이</span>
        )}
      </div>
    </Link>
  );
}
