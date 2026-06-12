'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category, Unit } from '@/lib/types';
import { getUnitProgress, getUnitMastery } from '@/lib/storage';
import UnitCard from '@/components/UnitCard';

interface CategoryContentProps {
  category: Category;
  units: Unit[];
  questionCounts: Record<string, number>;
  totalQuestions: number;
}

type Progress = Record<string, { attempts: number; bestScore: number | null }>;

export default function CategoryContent({ category, units, questionCounts, totalQuestions }: CategoryContentProps) {
  const [progress, setProgress] = useState<Progress>({});
  const [masteryMap, setMasteryMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setProgress(getUnitProgress());
    const m: Record<string, boolean> = {};
    for (const u of units) {
      m[u.code] = getUnitMastery(u.code).mastered;
    }
    setMasteryMap(m);
  }, [units]);

  const regularUnits = units.filter(u => !u.advanced && !u.summary);
  const summaryUnits = units.filter(u => u.summary);
  const advancedUnits = units.filter(u => u.advanced);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/" className="text-sm text-text-secondary hover:text-primary mb-4 inline-block">
        &larr; 학습 영역 선택
      </Link>
      <h1 className="text-2xl font-bold mb-1">{category.name}</h1>
      <p className="text-text-secondary text-sm mb-6">{category.description}</p>

      {/* 섞어 풀기 버튼 */}
      {totalQuestions > 0 && (
        <Link
          href={`/category/${category.code}/mixed`}
          className="flex items-center justify-center gap-2 w-full mb-6 py-3 text-center bg-surface border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          이 영역 섞어 풀기 (랜덤 10문제)
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {regularUnits.map(unit => (
          <UnitCard
            key={unit.code}
            unit={unit}
            questionCount={questionCounts[unit.code] || 0}
            bestScore={progress[unit.code]?.bestScore ?? null}
            attempts={progress[unit.code]?.attempts ?? 0}
            mastered={masteryMap[unit.code]}
          />
        ))}
      </div>

      {summaryUnits.length > 0 && (
        <>
          <h2 className="text-lg font-bold mt-8 mb-1">&#128209; 총정리</h2>
          <p className="text-text-secondary text-sm mb-4">
            배운 내용을 종합하여 복습하고 실력을 점검하세요
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {summaryUnits.map(unit => (
              <UnitCard
                key={unit.code}
                unit={unit}
                questionCount={questionCounts[unit.code] || 0}
                bestScore={progress[unit.code]?.bestScore ?? null}
                attempts={progress[unit.code]?.attempts ?? 0}
                mastered={masteryMap[unit.code]}
              />
            ))}
          </div>
        </>
      )}

      {advancedUnits.length > 0 && (
        <>
          <h2 className="text-lg font-bold mt-8 mb-1">&#128293; 고난도 도전</h2>
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
                mastered={masteryMap[unit.code]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
