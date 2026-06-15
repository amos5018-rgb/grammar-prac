'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProfile, getUnitProgress, getDueCount } from '@/lib/storage';
import { getRecommendation, Recommendation, RecommendationType } from '@/lib/recommend';
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
      {recommendation && <RecommendationCard rec={recommendation} />}

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

const REC_STYLE: Record<RecommendationType, { wrap: string; title: string; eyebrow: string }> = {
  review:        { wrap: 'border-primary bg-primary-light', title: 'text-primary', eyebrow: '오늘의 복습' },
  'wrong-top':   { wrap: 'border-error bg-error-light', title: 'text-error', eyebrow: '오답 집중' },
  retry:         { wrap: 'border-warning bg-warning-light', title: 'text-warning', eyebrow: '약점 보강' },
  'full-challenge': { wrap: 'border-warning bg-warning-light', title: 'text-warning', eyebrow: '\u{1F451} 마스터 도전' },
  'master-push': { wrap: 'border-primary bg-primary-light', title: 'text-primary', eyebrow: '마스터 도전' },
  new:           { wrap: 'border-success bg-success-light', title: 'text-success', eyebrow: '새 단원' },
  summary:       { wrap: 'border-primary bg-primary-light', title: 'text-primary', eyebrow: '총정리' },
  study:         { wrap: 'border-success bg-success-light', title: 'text-success', eyebrow: '인출 연습' },
  advanced:      { wrap: 'border-warning bg-warning-light', title: 'text-warning', eyebrow: '고난도 도전' },
  done:          { wrap: 'border-success bg-success-light', title: 'text-success', eyebrow: '완료' },
};
const URGENT_STYLE = { wrap: 'border-error bg-error-light', title: 'text-error', eyebrow: '\u{1F525} 시험 임박' };

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const s = rec.urgent ? URGENT_STYLE : REC_STYLE[rec.type];
  return (
    <Link
      href={rec.href}
      className={`block w-full mb-5 p-5 rounded-2xl border-2 transition-all hover:shadow-md active:scale-[0.99] ${s.wrap}`}
    >
      <p className="text-xs font-medium text-text-secondary mb-1">{s.eyebrow}</p>
      <p className={`font-bold text-lg ${s.title}`}>{rec.title}</p>
      <p className="text-sm text-text-secondary mt-0.5">{rec.subtitle}</p>
    </Link>
  );
}
