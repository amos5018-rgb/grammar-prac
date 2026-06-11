'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category, Unit } from '@/lib/types';
import { getUnitProgress } from '@/lib/storage';
import UnitCard from '@/components/UnitCard';

interface CategoryContentProps {
  category: Category;
  units: Unit[];
  questionCounts: Record<string, number>;
}

type Progress = Record<string, { attempts: number; bestScore: number | null }>;

export default function CategoryContent({ category, units, questionCounts }: CategoryContentProps) {
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    setProgress(getUnitProgress());
  }, []);

  const regularUnits = units.filter(u => !u.advanced);
  const advancedUnits = units.filter(u => u.advanced);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/" className="text-sm text-text-secondary hover:text-primary mb-4 inline-block">
        &larr; 학습 영역 선택
      </Link>
      <h1 className="text-2xl font-bold mb-1">{category.name}</h1>
      <p className="text-text-secondary text-sm mb-6">{category.description}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {regularUnits.map(unit => (
          <UnitCard
            key={unit.code}
            unit={unit}
            questionCount={questionCounts[unit.code] || 0}
            bestScore={progress[unit.code]?.bestScore ?? null}
            attempts={progress[unit.code]?.attempts ?? 0}
          />
        ))}
      </div>

      {advancedUnits.length > 0 && (
        <>
          <h2 className="text-lg font-bold mt-8 mb-1">🔥 고난도 도전</h2>
          <p className="text-text-secondary text-sm mb-4">
            수능·모의평가 형식의 자료 제시형 문제로 실력을 시험해 보세요
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {advancedUnits.map(unit => (
              <UnitCard
                key={unit.code}
                unit={unit}
                questionCount={questionCounts[unit.code] || 0}
                bestScore={progress[unit.code]?.bestScore ?? null}
                attempts={progress[unit.code]?.attempts ?? 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
