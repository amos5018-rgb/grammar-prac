'use client';

import { useState, useEffect } from 'react';
import { Unit } from '@/lib/types';
import { getProfile, getUnitProgress } from '@/lib/storage';
import LoginForm from '@/components/LoginForm';
import UnitCard from '@/components/UnitCard';

interface HomeContentProps {
  units: Unit[];
  questionCounts: Record<string, number>;
}

type Progress = Record<string, { attempts: number; bestScore: number | null }>;

export default function HomeContent({ units, questionCounts }: HomeContentProps) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    setLoggedIn(!!getProfile());
    setProgress(getUnitProgress());
  }, []);

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <LoginForm
        onLogin={() => {
          setLoggedIn(true);
          setProgress(getUnitProgress());
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">단원 목록</h1>
      <p className="text-text-secondary text-sm mb-6">학습할 단원을 선택하세요</p>
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
