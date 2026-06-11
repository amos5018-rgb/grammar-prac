'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProfile, getUnitProgress } from '@/lib/storage';
import LoginForm from '@/components/LoginForm';

export interface CategoryCardData {
  code: string;
  name: string;
  description: string;
  unitCount: number;
  questionCount: number;
  unitCodes: string[];
}

type Progress = Record<string, { attempts: number; bestScore: number | null }>;

export default function HomeContent({ categories }: { categories: CategoryCardData[] }) {
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
      <h1 className="text-2xl font-bold mb-1">학습 영역 선택</h1>
      <p className="text-text-secondary text-sm mb-6">학습할 영역을 먼저 선택하세요</p>
      <div className="grid gap-4">
        {categories.map(cat => {
          const studiedCount = cat.unitCodes.filter(code => progress[code]?.attempts > 0).length;
          return (
            <Link
              key={cat.code}
              href={`/category/${cat.code}`}
              className="block bg-surface rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99]"
            >
              <h2 className="font-bold text-xl mb-1.5">{cat.name}</h2>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">{cat.description}</p>
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="bg-primary-light text-primary px-2.5 py-1 rounded-full font-medium">
                  단원 {cat.unitCount}개
                </span>
                <span className="bg-primary-light text-primary px-2.5 py-1 rounded-full font-medium">
                  {cat.questionCount}문제
                </span>
                {studiedCount > 0 && (
                  <span className="bg-success-light text-success px-2.5 py-1 rounded-full font-medium">
                    {studiedCount}/{cat.unitCount} 단원 학습
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
