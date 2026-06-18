'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { StudyCard, StudyCardReveal, StudyCardTable } from '@/lib/types';
import { saveStudyCompletion } from '@/lib/storage';
import { createAnalyticsId, enqueueAttemptSession } from '@/lib/analytics';

interface StudyReviewProps {
  unitCode: string;
  cards: StudyCard[];
}

function hasJongseong(str: string): boolean {
  const last = str.charCodeAt(str.length - 1);
  if (last < 0xAC00 || last > 0xD7A3) return false;
  return (last - 0xAC00) % 28 !== 0;
}

// 레거시(음운) 카드의 3칸을 범용 reveals 형태로 변환
function legacyReveals(card: StudyCard): StudyCardReveal[] {
  const list: StudyCardReveal[] = [];
  if (card.definition != null) {
    list.push({ label: `${card.name}의 개념을 정의하면?`, content: card.definition });
  }
  if (card.formula != null) {
    list.push({ label: '무엇이 → 무엇으로 / 어디에서', content: card.formula });
  }
  if (card.nonExampleReason != null) {
    list.push({
      label: `${card.name}${hasJongseong(card.name) ? '이' : '가'} 비예시에 적용되지 않는 이유는?`,
      content: card.nonExampleReason,
    });
  }
  return list;
}

export default function StudyReview({ unitCode, cards }: StudyReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, Set<string>>>({});
  const [completed, setCompleted] = useState(false);
  const attemptIdRef = useRef(createAnalyticsId('attempt'));
  const startedAtRef = useRef(new Date().toISOString());
  const startMsRef = useRef(Date.now());
  const sessionRecordedRef = useRef(false);

  const card = cards[currentIndex];
  const cardRevealed = revealed[currentIndex] || new Set<string>();
  const reveals = card.reveals && card.reveals.length > 0 ? card.reveals : legacyReveals(card);
  const hasTable = reveals.some(r => r.table);

  function resetAnalyticsAttempt() {
    attemptIdRef.current = createAnalyticsId('attempt');
    startedAtRef.current = new Date().toISOString();
    startMsRef.current = Date.now();
    sessionRecordedRef.current = false;
  }

  function recordStudySession(exitReason: string, done: boolean) {
    if (sessionRecordedRef.current) return;
    sessionRecordedRef.current = true;
    enqueueAttemptSession({
      attemptId: attemptIdRef.current,
      unitCode,
      mode: 'study_cards',
      startedAt: startedAtRef.current,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startMsRef.current,
      score: done ? cards.length : currentIndex,
      total: cards.length,
      completed: done,
      exitReason,
    });
  }

  function toggle(key: string) {
    setRevealed(prev => {
      const current = new Set(prev[currentIndex] || []);
      if (current.has(key)) {
        current.delete(key);
      } else {
        current.add(key);
      }
      return { ...prev, [currentIndex]: current };
    });
  }

  // 표의 모든 답 셀을 한 번에 공개/접기 (스크롤로 못 본 셀 누락 방지)
  function setTableAll(keyPrefix: string, table: StudyCardTable, reveal: boolean) {
    setRevealed(prev => {
      const current = new Set(prev[currentIndex] || []);
      table.rows.forEach((row, ri) =>
        row.forEach((_, ci) => {
          if (ci === 0) return;
          const k = `${keyPrefix}-${ri}-${ci}`;
          if (reveal) current.add(k);
          else current.delete(k);
        }),
      );
      return { ...prev, [currentIndex]: current };
    });
  }

  function goNext() {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      saveStudyCompletion(unitCode);
      recordStudySession('completed', true);
      setCompleted(true);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="bg-surface rounded-2xl border border-border p-8">
          <div className="text-5xl mb-4">&#9989;</div>
          <h2 className="text-2xl font-bold mb-2">복습 완료!</h2>
          <p className="text-text-secondary mb-6">
            {cards.length}개 카드를 모두 복습했습니다.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setRevealed({});
                setCompleted(false);
                resetAnalyticsAttempt();
              }}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              다시 복습하기
            </button>
            <Link
              href={`/units/${unitCode}`}
              className="w-full py-3 bg-gray-100 dark:bg-white/10 text-text-secondary rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-colors text-center"
            >
              돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 상단 진행 표시 */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/units/${unitCode}`}
          onClick={() => recordStudySession('manual_exit', false)}
          className="text-base text-text-secondary hover:text-primary"
        >
          &larr; 돌아가기
        </Link>
        <span className="text-base font-medium text-text-secondary">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* 진행 바 */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mb-6">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* 카드 */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        {/* 상위 분류 배지 */}
        {card.group && (
          <span className="inline-block bg-primary-light text-primary text-sm font-semibold px-2.5 py-1 rounded-full mb-2">
            {card.group}
          </span>
        )}

        {/* 이름 */}
        <h2 className="text-2xl font-bold mb-4">{card.name}</h2>

        {card.reveals && card.reveals.length > 0 ? (
          // 문법 카드: 예문(인출 단서)을 세로 목록으로 노출
          card.examples && card.examples.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-medium text-text-secondary mb-1.5">
                &#9998; {card.exampleLabel ?? '예시'} (인출 단서)
              </div>
              <ul className="space-y-1.5">
                {card.examples.map((ex, i) => (
                  <li
                    key={i}
                    className="bg-primary-light/60 text-text rounded-lg px-3 py-2.5 text-base leading-relaxed border-l-2 border-primary/50"
                  >
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : (
          // 레거시(음운) 카드: 예시 / 비예시 배지 2열
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[140px]">
              <div className="text-sm font-medium text-success mb-1.5">&#9898; {card.exampleLabel ?? '예시'}</div>
              <div className="flex flex-wrap gap-1.5">
                {(card.examples ?? []).map((ex, i) => (
                  <span key={i} className="bg-success-light text-success px-2.5 py-1 rounded-lg text-base font-medium">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
            {card.nonExamples && card.nonExamples.length > 0 && (
              <div className="flex-1 min-w-[140px]">
                <div className="text-sm font-medium text-error mb-1.5">&#10060; 비예시</div>
                <div className="flex flex-wrap gap-1.5">
                  {card.nonExamples.map((ex, i) => (
                    <span key={i} className="bg-error-light text-error px-2.5 py-1 rounded-lg text-base font-medium">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 셀 인출 안내 */}
        {hasTable && (
          <p className="text-sm text-text-secondary mb-2">표의 각 칸을 탭하면 내용이 나타납니다. 표가 화면보다 넓으면 좌우로 넘겨 보세요.</p>
        )}

        {/* 인출칸 (가변 개수) */}
        <div className="space-y-4">
          {reveals.map((r, i) =>
            r.table ? (
              <TableReveal
                key={i}
                label={r.label}
                table={r.table}
                keyPrefix={`c${i}`}
                revealedKeys={cardRevealed}
                onToggleCell={(row, col) => toggle(`c${i}-${row}-${col}`)}
                onSetAll={(reveal) => setTableAll(`c${i}`, r.table!, reveal)}
              />
            ) : (
              <RevealBox
                key={i}
                label={r.label}
                content={r.content}
                isRevealed={cardRevealed.has(`t${i}`)}
                onToggle={() => toggle(`t${i}`)}
              />
            )
          )}
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="flex gap-3">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex-1 py-3 rounded-xl font-semibold transition-colors bg-gray-100 dark:bg-white/10 text-text-secondary hover:bg-gray-200 dark:hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          이전
        </button>
        <button
          onClick={goNext}
          className="flex-1 py-3 rounded-xl font-semibold transition-colors bg-primary text-white hover:bg-primary-dark"
        >
          {currentIndex === cards.length - 1 ? '완료' : '다음'}
        </button>
      </div>
    </div>
  );
}

function RevealBox({
  label,
  content,
  isRevealed,
  onToggle,
}: {
  label: string;
  content?: string;
  isRevealed: boolean;
  onToggle: () => void;
}) {
  if (isRevealed) {
    return (
      <button
        onClick={onToggle}
        className="w-full rounded-xl border border-border bg-gray-50 dark:bg-white/5 p-4 text-left hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      >
        <div className="text-sm font-medium text-text-secondary mb-1">{label}</div>
        <p className="text-base leading-relaxed whitespace-pre-line">{content}</p>
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="w-full rounded-xl border-2 border-primary/40 bg-primary-light p-4 text-left hover:border-primary hover:bg-primary/10 transition-colors group"
    >
      <div className="text-base font-semibold text-text mb-1">{label}</div>
      <p className="text-base font-medium text-primary group-hover:text-primary-dark transition-colors">
        탭하여 확인 &rarr;
      </p>
    </button>
  );
}

// 표를 항상 노출하되, 첫 열(질문/행 머리)은 보이고 나머지 답 셀은 탭하여 인출
function TableReveal({
  label,
  table,
  keyPrefix,
  revealedKeys,
  onToggleCell,
  onSetAll,
}: {
  label: string;
  table: StudyCardTable;
  keyPrefix: string;
  revealedKeys: Set<string>;
  onToggleCell: (row: number, col: number) => void;
  onSetAll: (reveal: boolean) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  const updateFade = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setFade({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 });
  };

  useEffect(() => {
    updateFade();
    window.addEventListener('resize', updateFade);
    return () => window.removeEventListener('resize', updateFade);
  }, []);

  // 답 셀(첫 열 제외) 공개 현황
  let total = 0;
  let revealedCount = 0;
  table.rows.forEach((row, ri) =>
    row.forEach((_, ci) => {
      if (ci === 0) return;
      total++;
      if (revealedKeys.has(`${keyPrefix}-${ri}-${ci}`)) revealedCount++;
    }),
  );
  const allRevealed = total > 0 && revealedCount === total;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-base font-semibold text-text">{label}</div>
        <button
          onClick={() => onSetAll(!allRevealed)}
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          {allRevealed ? '모두 접기' : '모두 펼치기'}
        </button>
      </div>
      <div className="relative">
        <div ref={scrollRef} onScroll={updateFade} className="overflow-x-auto">
        <table className="w-full text-[17px] border-collapse">
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th
                  key={i}
                  className="border border-border bg-background px-3.5 py-3 font-semibold text-left text-text whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  if (ci === 0) {
                    return (
                      <td
                        key={ci}
                        className="border border-border px-3.5 py-3 align-top font-semibold text-text whitespace-nowrap bg-background/50"
                      >
                        {cell}
                      </td>
                    );
                  }
                  const revealed = revealedKeys.has(`${keyPrefix}-${ri}-${ci}`);
                  return (
                    <td key={ci} className="border border-border p-0 align-top min-w-[130px]">
                      <button
                        onClick={() => onToggleCell(ri, ci)}
                        className={`block w-full text-left px-3.5 py-4 min-h-[56px] transition-colors ${
                          revealed
                            ? 'text-text leading-relaxed hover:bg-gray-100 dark:hover:bg-white/10'
                            : 'text-center font-semibold text-primary bg-primary-light hover:bg-primary/10'
                        }`}
                        aria-label={revealed ? undefined : '탭하여 확인'}
                      >
                        {revealed ? cell : '탭'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {/* 좌우 스크롤 가능 표시 (가려진 셀 누락 방지) */}
        {fade.left && (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-surface to-transparent" />
        )}
        {fade.right && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface to-transparent flex items-center justify-end">
            <span className="text-primary text-lg pr-0.5">&rsaquo;</span>
          </div>
        )}
      </div>
      <div className="mt-1.5 text-sm text-text-secondary">
        {revealedCount === 0
          ? '아직 확인한 칸이 없습니다.'
          : allRevealed
            ? `모든 칸 확인 완료 (${total}/${total})`
            : `${revealedCount} / ${total}칸 확인`}
      </div>
    </div>
  );
}
