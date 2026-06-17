'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Unit, UnitBlock } from '@/lib/types';
import { getBestScore, getUnitAttemptCount, getUnitTier, getStudyCompletion, getDedupedWrongAnswers, getCorrectQuestionIds, isMasterCandidate } from '@/lib/storage';

interface UnitDetailProps {
  unit: Unit;
  questionCount: number;
  questionIds?: string[];
  blockQuestionIds?: Record<string, string[]>;
}

type Mode = { label: string; href: string; wrong?: boolean; wrongFull?: boolean; full?: boolean };

export default function UnitDetail({ unit, questionCount, questionIds = [], blockQuestionIds }: UnitDetailProps) {
  if (unit.study) {
    return <StudyUnitDetail unit={unit} cardCount={questionCount} />;
  }

  if (unit.blocks && unit.blocks.length > 0 && blockQuestionIds) {
    return <BlockUnitDetail unit={unit} questionCount={questionCount} questionIds={questionIds} blockQuestionIds={blockQuestionIds} />;
  }

  return <StandardUnitDetail unit={unit} questionCount={questionCount} questionIds={questionIds} />;
}

// ── 블록 선택 UI ──

function BlockUnitDetail({ unit, questionCount, questionIds, blockQuestionIds }: {
  unit: Unit;
  questionCount: number;
  questionIds: string[];
  blockQuestionIds: Record<string, string[]>;
}) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const blocks = unit.blocks!;

  const bestScore = getBestScore(unit.code);
  const attempts = getUnitAttemptCount(unit.code);
  const tier = getUnitTier(unit.code);

  const correctSet = getCorrectQuestionIds();
  const covered = questionIds.filter(id => correctSet.has(id)).length;
  const coveragePct = questionIds.length > 0 ? Math.round((covered / questionIds.length) * 100) : 0;
  const isCandidate = isMasterCandidate(unit.code, questionIds);

  const wrongSet = new Set(getDedupedWrongAnswers().map(w => w.questionId));
  const wrongCount = questionIds.filter(id => wrongSet.has(id)).length;

  const base = `/units/${unit.code}/quiz`;
  const wrongBase = `/review/quiz?unit=${unit.code}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/category/${unit.category}`}
        className="text-sm text-text-secondary hover:text-primary mb-4 inline-block"
      >
        &larr; 단원 목록
      </Link>

      {/* 단원 헤더 */}
      <div className="animate-fade-up bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-6 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{unit.name}</h1>
          <span className="text-2xl" title={tier.label}>{tier.emoji}</span>
          <span className="text-sm font-medium text-text-secondary">{tier.label}</span>
        </div>
        <p className="text-text-secondary mb-4">{unit.description}</p>

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

        {/* 전체 진행도 */}
        {questionIds.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-text">전체 진행도</span>
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

        {isCandidate && (
          <p className="text-sm font-medium text-primary mb-4 bg-primary-light rounded-lg px-4 py-2.5">
            &#128293; 전부 풀기로 마스터에 도전하세요! 100%면 마스터 달성!
          </p>
        )}

        {/* 전체 모드 */}
        <div className="space-y-2.5">
          <Link
            href={`${base}?n=10`}
            className="block w-full py-3.5 text-center rounded-xl font-semibold text-base transition-all active:scale-[0.99] bg-primary text-white shadow-[var(--shadow-sm)] hover:bg-primary-dark hover:shadow-[var(--shadow-md)]"
          >
            전체 랜덤 10문제 풀기
          </Link>
          <Link
            href={base}
            className={`block w-full py-3.5 text-center rounded-xl font-semibold text-base transition-all active:scale-[0.99] border-2 border-primary text-primary hover:bg-primary hover:text-white${isCandidate ? ' ring-2 ring-primary/40' : ''}`}
          >
            전부 풀기 ({questionCount}문제)
          </Link>
          {wrongCount >= 1 && (
            <Link
              href={wrongBase}
              className="block w-full py-3.5 text-center rounded-xl font-semibold text-base transition-all active:scale-[0.99] bg-warning text-white shadow-[var(--shadow-sm)] hover:bg-warning/90"
            >
              틀린 문제 모아풀기 ({wrongCount}문제)
            </Link>
          )}
        </div>
      </div>

      {/* 블록 선택 */}
      <div className="animate-fade-up bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-5">
        <h2 className="text-base font-bold mb-3">블록 선택</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {blocks.map(b => {
            const bIds = blockQuestionIds[b.code] || [];
            const bCovered = bIds.filter(id => correctSet.has(id)).length;
            const bPct = bIds.length > 0 ? Math.round((bCovered / bIds.length) * 100) : 0;
            const isSelected = selectedBlock === b.code;
            return (
              <button
                key={b.code}
                onClick={() => setSelectedBlock(isSelected ? null : b.code)}
                className={`relative text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary-light shadow-[var(--shadow-sm)]'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-text-secondary'
                  }`}>{b.code}</span>
                  <span className="text-sm font-semibold truncate">{b.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full transition-all" style={{ width: `${bPct}%` }} />
                  </div>
                  <span className="text-xs text-text-secondary whitespace-nowrap">{bCovered}/{bIds.length}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 선택된 블록 모드 */}
        {selectedBlock && (
          <SelectedBlockPanel
            block={blocks.find(b => b.code === selectedBlock)!}
            unitCode={unit.code}
            blockIds={blockQuestionIds[selectedBlock] || []}
            correctSet={correctSet}
            wrongSet={wrongSet}
          />
        )}
      </div>
    </div>
  );
}

function SelectedBlockPanel({ block, unitCode, blockIds, correctSet, wrongSet }: {
  block: UnitBlock;
  unitCode: string;
  blockIds: string[];
  correctSet: Set<string>;
  wrongSet: Set<string>;
}) {
  const base = `/units/${unitCode}/quiz?block=${block.code}`;
  const wrongBase = `/review/quiz?unit=${unitCode}&block=${block.code}`;
  const bWrongCount = blockIds.filter(id => wrongSet.has(id)).length;

  const modes: Mode[] = [];
  if (blockIds.length > 5) modes.push({ label: '랜덤 5문제 풀기', href: `${base}&n=5` });
  modes.push({ label: `전부 풀기 (${blockIds.length}문제)`, href: base, full: true });
  if (bWrongCount >= 1) {
    modes.push({ label: `틀린 문제 모아풀기 (${bWrongCount}문제)`, href: wrongBase, wrong: true, wrongFull: true });
  }

  return (
    <div className="animate-fade-in bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-border/50">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary text-white">{block.code}</span>
        <span className="font-semibold text-sm">{block.name}</span>
      </div>
      <p className="text-xs text-text-secondary mb-3">{block.description}</p>
      <div className="space-y-2">
        {modes.map(m => (
          <Link
            key={m.label}
            href={m.href}
            className={`block w-full py-3 text-center rounded-xl font-semibold text-sm transition-all active:scale-[0.99] ${
              m.wrongFull
                ? 'bg-warning text-white hover:bg-warning/90'
                : m.full
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
            }`}
          >
            {m.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── 기존 표준 UI (블록 없는 단원용) ──

function StandardUnitDetail({ unit, questionCount, questionIds }: {
  unit: Unit;
  questionCount: number;
  questionIds: string[];
}) {
  const bestScore = getBestScore(unit.code);
  const attempts = getUnitAttemptCount(unit.code);
  const tier = getUnitTier(unit.code);

  const correctSet = getCorrectQuestionIds();
  const covered = questionIds.filter(id => correctSet.has(id)).length;
  const coveragePct = questionIds.length > 0 ? Math.round((covered / questionIds.length) * 100) : 0;
  const isCandidate = isMasterCandidate(unit.code, questionIds);

  const base = `/units/${unit.code}/quiz`;
  const modes: Mode[] = [];
  if (unit.advanced) {
    modes.push({ label: '문제 풀기 시작', href: base, full: true });
  } else {
    const isReview = !!unit.summary;
    if (questionCount > 5) modes.push({ label: '랜덤 5문제 풀기', href: `${base}?n=5` });
    if (isReview && questionCount > 10) modes.push({ label: '랜덤 10문제 풀기', href: `${base}?n=10` });
    modes.push({ label: `전부 풀기 (${questionCount}문제)`, href: base, full: true });
  }

  const primaryLabel = isCandidate
    ? modes.find(m => m.full)?.label
    : modes.find(m => !m.wrong)?.label;

  const wrongSet = new Set(getDedupedWrongAnswers().map(w => w.questionId));
  const wrongCount = questionIds.filter(id => wrongSet.has(id)).length;
  if (wrongCount >= 1) {
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
