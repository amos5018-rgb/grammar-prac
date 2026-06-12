'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProfile, getUnitProgress, getDueCount, getStreak, getExamCalendar, getDday } from '@/lib/storage';
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
  const [streak, setStreak] = useState(0);
  const [calendar, setCalendar] = useState<{ date: string; active: boolean; isToday: boolean; isExam: boolean; isPast: boolean }[]>([]);
  const [dday, setDday] = useState(0);

  useEffect(() => {
    setLoggedIn(!!getProfile());
    setProgress(getUnitProgress());
    setDueCount(getDueCount());
    setRecommendation(getRecommendation());
    setStreak(getStreak());
    setCalendar(getExamCalendar());
    setDday(getDday());
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
          setStreak(getStreak());
          setCalendar(getExamCalendar());
          setDday(getDday());
        }}
      />
    );
  }

  const activeDays = calendar.filter(d => d.active).length;
  const totalDays = calendar.filter(d => d.isPast || d.isToday).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* D-day 배너 + 학습 달력 */}
      <div className="bg-surface rounded-2xl border border-border p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">&#128293;</span>
            <div>
              <span className="font-bold">
                {streak > 0 ? `${streak}일 연속 학습 중!` : '오늘 학습을 시작해 보세요!'}
              </span>
              {totalDays > 0 && (
                <span className="text-xs text-text-secondary ml-2">
                  ({activeDays}/{totalDays}일 학습)
                </span>
              )}
            </div>
          </div>
          {dday > 0 && (
            <span className="text-base font-extrabold text-error">
              D-{dday}
            </span>
          )}
          {dday === 0 && (
            <span className="text-base font-extrabold text-primary">D-Day</span>
          )}
        </div>

        {calendar.length > 0 && (
          <div className="flex gap-1">
            {calendar.map(({ date, active, isToday, isExam, isPast }) => {
              const day = parseInt(date.split('-')[2]);
              let bg = 'bg-gray-100 dark:bg-white/10';
              let text = 'text-text-secondary';
              if (isExam) {
                bg = active ? 'bg-error' : 'bg-error/10';
                text = active ? 'text-white' : 'text-error';
              } else if (active) {
                bg = 'bg-primary';
                text = 'text-white';
              } else if (isToday) {
                bg = 'bg-primary/10 ring-1 ring-primary';
                text = 'text-primary';
              } else if (isPast) {
                text = 'text-text-secondary/40';
              }
              return (
                <div
                  key={date}
                  className={`flex-1 aspect-square rounded-md flex items-center justify-center text-[10px] font-medium ${bg} ${text} relative`}
                >
                  {day}
                  {isExam && <span className="absolute -top-1 -right-0.5 text-[7px]">&#128680;</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
