'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category, Unit } from '@/lib/types';
import { getUnitProgress, getCorrectQuestionIds, getUnitTierMap, UnitTier } from '@/lib/storage';
import { questionIdMap } from '@/data/questions/question-id-map';
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
  const [coveredMap, setCoveredMap] = useState<Record<string, number>>({});
  const [tierMap, setTierMap] = useState<Record<string, UnitTier>>({});
  useEffect(() => {
    setProgress(getUnitProgress());
    setTierMap(getUnitTierMap());
    const correct = getCorrectQuestionIds();
    const cov: Record<string, number> = {};
    for (const u of units) {
      if (u.study) continue;
      cov[u.code] = (questionIdMap[u.code] ?? []).filter(id => correct.has(id)).length;
    }
    setCoveredMap(cov);
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
          className="flex items-center justify-center gap-2 w-full mb-6 py-3 text-center bg-surface border-2 border-primary text-primary rounded-xl font-semibold shadow-[var(--shadow-sm)] hover:bg-primary hover:text-white hover:shadow-[var(--shadow-md)] transition-all active:scale-[0.99]"
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
        {regularUnits.map((unit, i) => (
          <UnitCard
            key={unit.code}
            unit={unit}
            questionCount={questionCounts[unit.code] || 0}
            bestScore={progress[unit.code]?.bestScore ?? null}
            attempts={progress[unit.code]?.attempts ?? 0}
            covered={coveredMap[unit.code] ?? 0}
            tier={tierMap[unit.code]}
            index={i}
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
            {summaryUnits.map((unit, i) => (
              <UnitCard
                key={unit.code}
                unit={unit}
                questionCount={questionCounts[unit.code] || 0}
                bestScore={progress[unit.code]?.bestScore ?? null}
                attempts={progress[unit.code]?.attempts ?? 0}
                covered={coveredMap[unit.code] ?? 0}
                tier={tierMap[unit.code]}
                index={i}
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
            {advancedUnits.map((unit, i) => (
              <UnitCard
                key={unit.code}
                unit={unit}
                questionCount={questionCounts[unit.code] || 0}
                bestScore={progress[unit.code]?.bestScore ?? null}
                attempts={progress[unit.code]?.attempts ?? 0}
                covered={coveredMap[unit.code] ?? 0}
                tier={tierMap[unit.code]}
                index={i}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
