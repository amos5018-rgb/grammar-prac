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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/" className="text-sm text-text-secondary hover:text-primary mb-4 inline-block">
        &larr; 학습 영역 선택
      </Link>
      <h1 className="text-2xl font-bold mb-1">{category.name}</h1>
      <p className="text-text-secondary text-sm mb-6">{category.description}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {units.map(unit => (
          <UnitCard
            key={unit.code}
            unit={unit}
            questionCount={questionCounts[unit.code] || 0}
            bestScore={progress[unit.code]?.bestScore ?? null}
            attempts={progress[unit.code]?.attempts ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
