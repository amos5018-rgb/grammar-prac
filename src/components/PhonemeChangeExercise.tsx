'use client';

import { useState } from 'react';
import { PhonemeChangeStep } from '@/lib/types';

// 연음은 음운 변동이 아니므로 선택지에 포함하지 않음
const CHANGE_OPTIONS = [
  '음절의 끝소리 규칙',
  '자음군 단순화',
  '비음화',
  'ㄹ의 비음화',
  '유음화',
  '구개음화',
  '된소리되기',
  '거센소리되기',
  'ㅎ 탈락',
];

interface Props {
  word: string;
  steps: PhonemeChangeStep[];
  value: string[];
  onChange: (answers: string[]) => void;
  disabled?: boolean;
}

export default function PhonemeChangeExercise({ word, steps, value, onChange, disabled }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSlotTap = (idx: number) => {
    if (disabled) return;
    if (value[idx]) {
      const next = [...value];
      next[idx] = '';
      onChange(next);
    } else if (selected) {
      const next = [...value];
      next[idx] = selected;
      onChange(next);
      setSelected(null);
    }
  };

  const handlePillTap = (option: string) => {
    if (disabled) return;
    setSelected(prev => (prev === option ? null : option));
  };

  return (
    <div className="space-y-5">
      {/* Step diagram */}
      <div className="flex flex-col items-center gap-1">
        {/* Word */}
        <span className="text-xl font-bold">{word}</span>

        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            {/* Arrow */}
            <span className="text-primary text-lg leading-none">↓</span>

            {/* Slot */}
            <button
              type="button"
              onClick={() => handleSlotTap(idx)}
              className={`min-w-[8rem] px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                value[idx]
                  ? 'border-primary bg-primary-light text-primary border-solid cursor-pointer'
                  : selected
                    ? 'border-primary/50 bg-primary-light/30 border-dashed cursor-pointer animate-pulse'
                    : 'border-border border-dashed text-text-secondary'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {value[idx] || '? 변동 선택'}
            </button>

            {/* Pronunciation result */}
            <div className="px-4 py-1.5 bg-gray-50 dark:bg-white/5 rounded-lg border border-border text-base font-medium">
              [ {step.result} ]
            </div>
          </div>
        ))}
      </div>

      {/* Option pills */}
      <div>
        <p className="text-xs text-text-secondary text-center mb-2">
          {selected ? `'${selected}' 선택됨 — 위 빈칸을 눌러 넣으세요` : '아래에서 음운 변동을 선택하세요'}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {CHANGE_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => handlePillTap(option)}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                selected === option
                  ? 'border-primary bg-primary text-white scale-105 shadow-md'
                  : 'border-border bg-gray-50 dark:bg-white/5 text-text hover:border-primary/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
