'use client';

import Link from 'next/link';
import { Unit } from '@/lib/types';
import { getBestScore, getUnitAttemptCount, getUnitTier, getStudyCompletion, getUnitWrongQuestionIds } from '@/lib/storage';

interface UnitDetailProps {
  unit: Unit;
  questionCount: number;
}

export default function UnitDetail({ unit, questionCount }: UnitDetailProps) {
  if (unit.study) {
    return <StudyUnitDetail unit={unit} cardCount={questionCount} />;
  }

  const bestScore = getBestScore(unit.code);
  const attempts = getUnitAttemptCount(unit.code);
  const tier = getUnitTier(unit.code);

  // 풀이 모드 구성
  //  - 고난도 소단원: 전부 풀기만
  //  - 음운 변동 총정리 문제편: 랜덤 5 / 랜덤 10 / 전부 풀기
  //  - 그 외 일반 소단원: 랜덤 5 / 전부 풀기
  const base = `/units/${unit.code}/quiz`;
  const modes: { label: string; href: string }[] = [];
  if (unit.advanced) {
    modes.push({ label: '문제 풀기 시작', href: base });
  } else {
    const isReview = unit.code === 'phoneme-change-review';
    if (questionCount > 5) modes.push({ label: '랜덤 5문제 풀기', href: `${base}?n=5` });
    if (isReview && questionCount > 10) modes.push({ label: '랜덤 10문제 풀기', href: `${base}?n=10` });
    modes.push({ label: `전부 풀기 (${questionCount}문제)`, href: base });

    // 틀린 문제 모아풀기 (오답 노트 기반)
    const wrongCount = getUnitWrongQuestionIds(unit.code).length;
    if (wrongCount >= 1) {
      modes.push({ label: `틀린 문제 모아풀기 (${wrongCount}문제)`, href: `/review/quiz?unit=${unit.code}` });
    }
    if (wrongCount >= 6) {
      modes.push({ label: '틀린 문제 랜덤 5문제 풀기', href: `/review/quiz?unit=${unit.code}&n=5` });
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/category/${unit.category}`}
        className="text-sm text-text-secondary hover:text-primary mb-4 inline-block"
      >
        &larr; 단원 목록
      </Link>

      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{unit.name}</h1>
          <span className="text-2xl" title={tier.label}>{tier.emoji}</span>
          <span className="text-sm font-medium text-text-secondary">{tier.label}</span>
        </div>
        <p className="text-text-secondary mb-6">{unit.description}</p>

        <div className="flex flex-wrap gap-3 text-sm mb-4">
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

        {tier.hint && (
          <p className="text-sm text-text-secondary mb-4 bg-gray-50 dark:bg-white/5 rounded-lg px-4 py-2.5">
            {tier.level === 'beginner' ? '⭐' : tier.level === 'challenger' ? '\u{1F4AA}' : '\u{1F451}'} 다음 칭호까지: {tier.hint}
          </p>
        )}

        <div className="space-y-3">
          {modes.map((m, i) => (
            <Link
              key={m.label}
              href={m.href}
              className={`block w-full py-4 text-center rounded-xl font-semibold text-base transition-colors ${
                i === 0
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudyUnitDetail({ unit, cardCount }: { unit: Unit; cardCount: number }) {
  const study = getStudyCompletion(unit.code);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/category/${unit.category}`}
        className="text-sm text-text-secondary hover:text-primary mb-4 inline-block"
      >
        &larr; 단원 목록
      </Link>

      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{unit.name}</h1>
        <p className="text-text-secondary mb-6">{unit.description}</p>

        <div className="flex flex-wrap gap-3 text-sm mb-4">
          <span className="bg-primary-light text-primary px-3 py-1.5 rounded-full font-medium">
            {cardCount}개 카드
          </span>
          {study.completed && (
            <span className="bg-success-light text-success px-3 py-1.5 rounded-full font-medium">
              {study.count}회 학습 완료
            </span>
          )}
        </div>

        <Link
          href={`/units/${unit.code}/study`}
          className="block w-full py-4 bg-primary text-white text-center rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors"
        >
          {study.completed ? '다시 학습하기' : '학습 시작'}
        </Link>
      </div>
    </div>
  );
}
