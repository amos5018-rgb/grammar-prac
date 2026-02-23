'use client';

import Link from 'next/link';
import { Unit } from '@/lib/types';
import { getBestScore, getUnitAttemptCount } from '@/lib/storage';

interface UnitDetailProps {
  unit: Unit;
  questionCount: number;
}

export default function UnitDetail({ unit, questionCount }: UnitDetailProps) {
  const bestScore = getBestScore(unit.code);
  const attempts = getUnitAttemptCount(unit.code);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-text-secondary hover:text-primary mb-4 inline-block">
        &larr; 단원 목록
      </Link>

      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{unit.name}</h1>
        <p className="text-text-secondary mb-6">{unit.description}</p>

        <div className="flex flex-wrap gap-3 text-sm mb-6">
          <span className="bg-primary-light text-primary px-3 py-1.5 rounded-full font-medium">
            {questionCount}문제
          </span>
          {bestScore !== null && (
            <span className={`px-3 py-1.5 rounded-full font-medium ${
              bestScore >= 80 ? 'bg-success-light text-success' :
              bestScore >= 50 ? 'bg-warning-light text-warning' :
              'bg-error-light text-error'
            }`}>
              최고 점수: {bestScore}점
            </span>
          )}
          {attempts > 0 && (
            <span className="bg-gray-100 dark:bg-white/10 text-text-secondary px-3 py-1.5 rounded-full">
              {attempts}회 풀이
            </span>
          )}
        </div>

        <Link
          href={`/units/${unit.code}/quiz`}
          className="block w-full py-4 bg-primary text-white text-center rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors"
        >
          문제 풀기 시작
        </Link>
      </div>
    </div>
  );
}
