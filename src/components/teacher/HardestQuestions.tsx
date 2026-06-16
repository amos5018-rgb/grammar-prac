'use client';

import { useState } from 'react';
import { UNIT_NAMES } from '@/data/unitNames';

interface QuestionRate {
  question_id: string;
  unit_code: string;
  question_text: string;
  attempts: number;
  correct_count: number;
  correct_rate: number;
}

interface WrongAnswer {
  answer: string;
  count: number;
}

interface QuestionDetail {
  questionId: string;
  totalCount: number;
  correctCount: number;
  correctAnswer: string;
  topWrongAnswers: WrongAnswer[];
}

function rateColor(rate: number) {
  if (rate < 60) return 'text-error';
  if (rate < 80) return 'text-warning';
  return 'text-success';
}

function rateBg(rate: number) {
  if (rate < 60) return 'bg-error-light';
  if (rate < 80) return 'bg-warning-light';
  return 'bg-success-light';
}

export default function HardestQuestions({ data }: { data: QuestionRate[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [details, setDetails] = useState<Record<string, QuestionDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  if (!data.length) {
    return <p className="text-sm text-text-secondary text-center py-4">아직 데이터가 없습니다.</p>;
  }

  const unitCodes = [...new Set(data.map(d => d.unit_code))].sort();
  const filtered = filter === 'all' ? data : data.filter(d => d.unit_code === filter);

  const handleExpand = async (questionId: string) => {
    if (expanded === questionId) {
      setExpanded(null);
      return;
    }
    setExpanded(questionId);

    if (!details[questionId]) {
      setLoadingDetail(questionId);
      try {
        const res = await fetch(`/api/teacher/question-detail?questionId=${encodeURIComponent(questionId)}`);
        if (res.ok) {
          const detail = await res.json();
          setDetails(prev => ({ ...prev, [questionId]: detail }));
        }
      } catch { /* ignore */ }
      setLoadingDetail(null);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="px-4 py-3 border-b border-border/70 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-text">어려운 문항 TOP {filtered.length}</h2>
          <p className="text-xs text-text-secondary mt-0.5">정답률이 낮은 순 · 클릭하여 오답 분포 보기</p>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">전체 단원</option>
          {unitCodes.map(code => (
            <option key={code} value={code}>{UNIT_NAMES[code] ?? code}</option>
          ))}
        </select>
      </div>

      <div className="divide-y divide-border/50 max-h-[520px] overflow-y-auto">
        {filtered.map((row, i) => {
          const isExpanded = expanded === row.question_id;
          const detail = details[row.question_id];
          const isLoading = loadingDetail === row.question_id;

          return (
            <button
              key={row.question_id}
              onClick={() => handleExpand(row.question_id)}
              className="w-full text-left px-4 py-3 hover:bg-background/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text">
                    <span className="text-text-secondary mr-1.5">#{i + 1}</span>
                    <span className="font-medium truncate">
                      {row.question_text || row.question_id}
                    </span>
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {UNIT_NAMES[row.unit_code] ?? row.unit_code} · {row.attempts}회 응시
                  </p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-sm font-bold tabular-nums ${rateColor(row.correct_rate)} ${rateBg(row.correct_rate)}`}>
                  {row.correct_rate}%
                </span>
              </div>

              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {row.question_text && (
                    <p className="text-sm text-text bg-background rounded-xl p-3 whitespace-pre-wrap">
                      {row.question_text}
                    </p>
                  )}

                  {isLoading && (
                    <p className="text-xs text-text-secondary text-center py-2">오답 분포 불러오는 중...</p>
                  )}

                  {detail && detail.topWrongAnswers.length > 0 && (
                    <div className="bg-background rounded-xl p-3">
                      <p className="text-xs font-bold text-text mb-2">자주 선택한 오답</p>
                      {detail.correctAnswer && (
                        <div className="flex items-center gap-2 mb-2 text-xs">
                          <span className="text-success font-bold">✓ 정답:</span>
                          <span className="text-text">{detail.correctAnswer}</span>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {detail.topWrongAnswers.map((w, wi) => {
                          const pct = detail.totalCount > 0 ? Math.round((w.count / detail.totalCount) * 100) : 0;
                          return (
                            <div key={wi} className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-xs text-error truncate">✗ {w.answer}</span>
                                  <span className="text-xs text-text-secondary tabular-nums shrink-0 ml-2">{w.count}명 ({pct}%)</span>
                                </div>
                                <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                                  <div className="h-full bg-error/60 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {detail && detail.topWrongAnswers.length === 0 && (
                    <p className="text-xs text-text-secondary text-center py-1">오답 분포 데이터가 없습니다.</p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
