'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudyCard } from '@/lib/types';
import { saveStudyCompletion } from '@/lib/storage';

interface StudyReviewProps {
  unitCode: string;
  cards: StudyCard[];
}

type RevealField = 'definition' | 'formula' | 'reason';

function hasJongseong(str: string): boolean {
  const last = str.charCodeAt(str.length - 1);
  if (last < 0xAC00 || last > 0xD7A3) return false;
  return (last - 0xAC00) % 28 !== 0;
}

export default function StudyReview({ unitCode, cards }: StudyReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, Set<RevealField>>>({});
  const [completed, setCompleted] = useState(false);

  const card = cards[currentIndex];
  const cardRevealed = revealed[currentIndex] || new Set<RevealField>();

  function toggle(field: RevealField) {
    setRevealed(prev => {
      const current = new Set(prev[currentIndex] || []);
      if (current.has(field)) {
        current.delete(field);
      } else {
        current.add(field);
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
            {cards.length}개 음운 변동을 모두 복습했습니다.
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
        {/* 이름 */}
        <h2 className="text-xl font-bold mb-4">{card.name}</h2>

        {/* 예시 / 비예시 */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[140px]">
            <div className="text-xs font-medium text-success mb-1.5">&#9898; 예시</div>
            <div className="flex flex-wrap gap-1.5">
              {card.examples.map((ex, i) => (
                <span key={i} className="bg-success-light text-success px-2.5 py-1 rounded-lg text-sm font-medium">
                  {ex}
                </span>
              ))}
            </div>
          </div>
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
        </div>

        {/* 인출 3칸 */}
        <div className="space-y-3">
          <RevealBox
            label={`1. ${card.name}의 개념을 정의하면?`}
            content={card.definition}
            isRevealed={cardRevealed.has('definition')}
            onToggle={() => toggle('definition')}
          />
          <RevealBox
            label="2. 무엇이 → 무엇으로 / 어디에서"
            content={card.formula}
            isRevealed={cardRevealed.has('formula')}
            onToggle={() => toggle('formula')}
          />
          <RevealBox
            label={`3. ${card.name}${hasJongseong(card.name) ? '이' : '가'} 비예시에 적용되지 않는 이유는?`}
            content={card.nonExampleReason}
            isRevealed={cardRevealed.has('reason')}
            onToggle={() => toggle('reason')}
          />
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
  content: string;
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
        <p className="text-sm leading-relaxed">{content}</p>
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 p-4 text-left hover:border-primary hover:bg-primary/5 transition-colors group"
    >
      <div className="text-xs font-medium text-text-secondary mb-1">{label}</div>
      <p className="text-sm text-text-secondary group-hover:text-primary transition-colors">
        탭하여 확인
      </p>
    </button>
  );
}
