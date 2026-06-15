'use client';

import Link from 'next/link';
import { Unit } from '@/lib/types';
import { getBestScore, getUnitAttemptCount, getUnitTier, getStudyCompletion, getDedupedWrongAnswers, getCorrectQuestionIds, isMasterCandidate } from '@/lib/storage';

interface UnitDetailProps {
  unit: Unit;
  questionCount: number;
  questionIds?: string[];
}

export default function UnitDetail({ unit, questionCount, questionIds = [] }: UnitDetailProps) {
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
  // 진행도: 한 번이라도 맞힌 문항 / 전체 문항
  const correctSet = getCorrectQuestionIds();
  const covered = questionIds.filter(id => correctSet.has(id)).length;
  const coveragePct = questionIds.length > 0 ? Math.round((covered / questionIds.length) * 100) : 0;
  const isCandidate = isMasterCandidate(unit.code, questionIds);

  const base = `/units/${unit.code}/quiz`;
  const modes: { label: string; href: string; wrong?: boolean; wrongFull?: boolean; full?: boolean }[] = [];
  if (unit.advanced) {
    modes.push({ label: '문제 풀기 시작', href: base, full: true });
  } else {
    const isReview = unit.code === 'phoneme-change-review';
    if (questionCount > 5) modes.push({ label: '랜덤 5문제 풀기', href: `${base}?n=5` });
    if (isReview && questionCount > 10) modes.push({ label: '랜덤 10문제 풀기', href: `${base}?n=10` });
    modes.push({ label: `전부 풀기 (${questionCount}문제)`, href: base, full: true });
  }

  // 강조할 버튼: 전환 후보면 '전부 풀기', 아니면 첫 풀기 버튼
  const primaryLabel = isCandidate
    ? modes.find(m => m.full)?.label
    : modes.find(m => !m.wrong)?.label;

  // 틀린 문제 모아풀기 (오답 노트 기반) — 일반·고난도 모두 적용
  // 문항 id로 집계해 고난도 분할 파트의 오답도 정확히 분리
  const wrongSet = new Set(getDedupedWrongAnswers().map(w => w.questionId));
  const wrongCount = questionIds.filter(id => wrongSet.has(id)).length;
  if (wrongCount >= 1) {
    // 고난도 분할 단원은 부모 코드 + 파트로 복습 퀴즈에 전달
    const wrongHref = unit.advanced && unit.parentCode != null && unit.partIndex != null
      ? `/review/quiz?unit=${unit.parentCode}&part=${unit.partIndex}`
      : `/review/quiz?unit=${unit.code}`;
    const sep = wrongHref.includes('?') ? '&' : '?';
    if (wrongCount >= 6) {
      modes.push({ label: '틀린 문제 랜덤 5문제 풀기', href: `${wrongHref}${sep}n=5`, wrong: true });
    }
    modes.push({ label: `틀린 문제 모아풀기 (${wrongCount}문제)`, href: wrongHref, wrong: true, wrongFull: true });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/category/${unit.category}`}
        className="text-sm text-text-secondary hover:text-primary mb-4 inline-block"
      >
        &larr; 단원 목록
      </Link>

      <div className="animate-fade-up bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{unit.name}</h1>
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

        {/* 진행도: 어떤 모드로 풀든 새 문제를 맞히면 채워짐 */}
        {questionIds.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-text">진행도</span>
              <span className="text-sm font-semibold text-success">
                {covered}/{questionIds.length}문제
                {coveragePct === 100 && ' · 완료 🎉'}
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full transition-all" style={{ width: `${coveragePct}%` }} />
            </div>
          </div>
        )}

        {isCandidate ? (
          <p className="text-sm font-medium text-primary mb-4 bg-primary-light rounded-lg px-4 py-2.5">
            &#128293; 전부 풀기로 마스터에 도전하세요! 100%면 마스터 달성!
          </p>
        ) : tier.hint && (
          <p className="text-sm text-text-secondary mb-4 bg-gray-50 dark:bg-white/5 rounded-lg px-4 py-2.5">
            {{ beginner: '⭐', challenger: '\u{1F525}', trainee: '\u{1F4AA}', skilled: '\u{1F451}', master: '\u{1F451}' }[tier.level]} 다음 칭호까지: {tier.hint}
          </p>
        )}

        <div className="space-y-3">
          {modes.map(m => {
            const isPrimary = !m.wrong && m.label === primaryLabel;
            const pulse = isCandidate && m.full ? ' ring-2 ring-primary/40' : '';
            return (
              <Link
                key={m.label}
                href={m.href}
                className={`block w-full py-4 text-center rounded-xl font-semibold text-base transition-all active:scale-[0.99] ${
                  m.wrongFull
                    ? 'bg-warning text-white shadow-[var(--shadow-sm)] hover:bg-warning/90 hover:shadow-[var(--shadow-md)]'
                    : m.wrong
                      ? 'border-2 border-warning text-warning hover:bg-warning hover:text-white'
                      : isPrimary
                        ? `bg-primary text-white shadow-[var(--shadow-sm)] hover:bg-primary-dark hover:shadow-[var(--shadow-md)]${pulse}`
                        : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {m.label}
              </Link>
            );
          })}
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

      <div className="animate-fade-up bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-6 mb-6">
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
