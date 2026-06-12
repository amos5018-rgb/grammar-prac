'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProfile, getUnitProgress, getDueCount } from '@/lib/storage';
import { getRecommendation, Recommendation } from '@/lib/recommend';
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
  const [dueCount, setDueCount] = useState(0);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  useEffect(() => {
    setLoggedIn(!!getProfile());
    setProgress(getUnitProgress());
    setDueCount(getDueCount());
    setRecommendation(getRecommendation());
  }, []);

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <LoginForm
        onLogin={() => {
          setLoggedIn(true);
          setProgress(getUnitProgress());
          setDueCount(getDueCount());
          setRecommendation(getRecommendation());
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* 다음 학습 추천 카드 */}
      {recommendation && (
        <Link
          href={recommendation.href}
          className={`block w-full mb-5 p-5 rounded-2xl border-2 transition-all hover:shadow-md active:scale-[0.99] ${
            recommendation.type === 'review'
              ? 'border-primary bg-primary-light'
              : recommendation.type === 'retry'
                ? 'border-warning bg-warning-light'
                : 'border-success bg-success-light'
          }`}
        >
          <p className="text-xs font-medium text-text-secondary mb-1">
            {recommendation.type === 'review' ? '오늘의 복습' : recommendation.type === 'retry' ? '약점 보강' : '새 단원'}
          </p>
          <p className={`font-bold text-lg ${
            recommendation.type === 'review' ? 'text-primary' :
            recommendation.type === 'retry' ? 'text-warning' : 'text-success'
          }`}>
            {recommendation.title}
          </p>
          <p className="text-sm text-text-secondary mt-0.5">{recommendation.subtitle}</p>
        </Link>
      )}

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
