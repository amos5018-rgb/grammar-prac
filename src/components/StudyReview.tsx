'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudyCard, StudyCardReveal, StudyCardTable } from '@/lib/types';
import { saveStudyCompletion } from '@/lib/storage';

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

  const card = cards[currentIndex];
  const cardRevealed = revealed[currentIndex] || new Set<string>();
  const reveals = card.reveals && card.reveals.length > 0 ? card.reveals : legacyReveals(card);
  const hasTable = reveals.some(r => r.table);

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

  function goNext() {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      saveStudyCompletion(unitCode);
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
          className="text-sm text-text-secondary hover:text-primary"
        >
          &larr; 돌아가기
        </Link>
        <span className="text-sm font-medium text-text-secondary">
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
          <span className="inline-block bg-primary-light text-primary text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
            {card.group}
          </span>
        )}

        {/* 이름 */}
        <h2 className="text-xl font-bold mb-4">{card.name}</h2>

        {card.reveals && card.reveals.length > 0 ? (
          // 문법 카드: 예문(인출 단서)을 세로 목록으로 노출
          card.examples && card.examples.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-medium text-text-secondary mb-1.5">
                &#9998; {card.exampleLabel ?? '예시'} (인출 단서)
              </div>
              <ul className="space-y-1.5">
                {card.examples.map((ex, i) => (
                  <li
                    key={i}
                    className="bg-primary-light/60 text-text rounded-lg px-3 py-2 text-sm leading-relaxed border-l-2 border-primary/50"
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
              <div className="text-xs font-medium text-success mb-1.5">&#9898; {card.exampleLabel ?? '예시'}</div>
              <div className="flex flex-wrap gap-1.5">
                {(card.examples ?? []).map((ex, i) => (
                  <span key={i} className="bg-success-light text-success px-2.5 py-1 rounded-lg text-sm font-medium">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
            {card.nonExamples && card.nonExamples.length > 0 && (
              <div className="flex-1 min-w-[140px]">
                <div className="text-xs font-medium text-error mb-1.5">&#10060; 비예시</div>
                <div className="flex flex-wrap gap-1.5">
                  {card.nonExamples.map((ex, i) => (
                    <span key={i} className="bg-error-light text-error px-2.5 py-1 rounded-lg text-sm font-medium">
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
          <p className="text-xs text-text-secondary mb-2">표의 칸을 탭하면 내용이 나타납니다.</p>
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
        <div className="text-xs font-medium text-text-secondary mb-1">{label}</div>
        <p className="text-sm leading-relaxed whitespace-pre-line">{content}</p>
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="w-full rounded-xl border-2 border-primary/40 bg-primary-light p-4 text-left hover:border-primary hover:bg-primary/10 transition-colors group"
    >
      <div className="text-sm font-semibold text-text mb-1">{label}</div>
      <p className="text-sm font-medium text-primary group-hover:text-primary-dark transition-colors">
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
}: {
  label: string;
  table: StudyCardTable;
  keyPrefix: string;
  revealedKeys: Set<string>;
  onToggleCell: (row: number, col: number) => void;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-text mb-2">{label}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th
                  key={i}
                  className="border border-border bg-background px-2 py-1.5 font-semibold text-left text-text whitespace-nowrap"
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
                        className="border border-border px-2 py-1.5 align-top font-medium text-text whitespace-nowrap bg-background/50"
                      >
                        {cell}
                      </td>
                    );
                  }
                  const revealed = revealedKeys.has(`${keyPrefix}-${ri}-${ci}`);
                  return (
                    <td key={ci} className="border border-border p-0 align-top min-w-[88px]">
                      <button
                        onClick={() => onToggleCell(ri, ci)}
                        className={`block w-full text-left px-2 py-1.5 transition-colors ${
                          revealed
                            ? 'text-text-secondary leading-relaxed hover:bg-gray-100 dark:hover:bg-white/10'
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
    </div>
  );
}
