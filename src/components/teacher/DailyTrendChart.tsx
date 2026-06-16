'use client';

import { useState } from 'react';

interface DailyData {
  date: string;
  activeStudents: number;
  totalAnswers: number;
  correctAnswers: number;
  correctRate: number;
}

interface Props {
  data: DailyData[];
}

type Range = 7 | 14 | 30;

export default function DailyTrendChart({ data }: Props) {
  const [range, setRange] = useState<Range>(14);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-6 text-center">
        <p className="text-sm text-text-secondary">아직 학습 데이터가 없습니다.</p>
      </div>
    );
  }

  const sliced = data.slice(-range);
  if (sliced.length === 0) return null;

  const maxStudents = Math.max(...sliced.map(d => d.activeStudents), 1);
  const maxAnswers = Math.max(...sliced.map(d => d.totalAnswers), 1);

  const W = 600;
  const H = 200;
  const PAD_L = 10;
  const PAD_R = 10;
  const PAD_T = 20;
  const PAD_B = 30;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const barWidth = Math.max(4, Math.min(20, chartW / sliced.length * 0.6));
  const gap = chartW / Math.max(sliced.length - 1, 1);

  // Rate line points
  const linePoints = sliced.map((d, i) => {
    const x = PAD_L + i * gap;
    const y = PAD_T + chartH - (d.correctRate / 100) * chartH;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="px-4 py-3 border-b border-border/70 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-text">일별 학습 추이</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary/30 mr-1 align-middle" />활동 학생 수
            <span className="inline-block w-2.5 h-0.5 rounded bg-primary ml-3 mr-1 align-middle" />정답률
          </p>
        </div>
        <div className="flex gap-1 bg-background rounded-lg p-0.5">
          {([7, 14, 30] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'
              }`}
            >
              {r}일
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Horizontal grid lines */}
          {[0, 25, 50, 75, 100].map(pct => {
            const y = PAD_T + chartH - (pct / 100) * chartH;
            return (
              <g key={pct}>
                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="var(--border)" strokeWidth={0.5} strokeDasharray={pct === 0 ? 'none' : '3,3'} />
                {pct > 0 && (
                  <text x={W - PAD_R + 2} y={y + 3} fontSize={8} fill="var(--text-secondary)" textAnchor="start">{pct}%</text>
                )}
              </g>
            );
          })}

          {/* Bars (total answers) */}
          {sliced.map((d, i) => {
            const x = PAD_L + i * gap;
            const barH = (d.activeStudents / maxStudents) * chartH;
            return (
              <rect
                key={`bar-${i}`}
                x={x - barWidth / 2}
                y={PAD_T + chartH - barH}
                width={barWidth}
                height={barH}
                rx={2}
                fill="var(--primary)"
                opacity={hoverIdx === i ? 0.5 : 0.2}
              />
            );
          })}

          {/* Rate line */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Rate dots */}
          {sliced.map((d, i) => {
            const x = PAD_L + i * gap;
            const y = PAD_T + chartH - (d.correctRate / 100) * chartH;
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r={hoverIdx === i ? 4 : 2.5}
                fill="var(--primary)"
                stroke="var(--surface)"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Hover targets */}
          {sliced.map((_, i) => {
            const x = PAD_L + i * gap;
            return (
              <rect
                key={`hover-${i}`}
                x={x - gap / 2}
                y={PAD_T}
                width={gap}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
              />
            );
          })}

          {/* Date labels */}
          {sliced.map((d, i) => {
            const x = PAD_L + i * gap;
            const showLabel = sliced.length <= 14 || i % Math.ceil(sliced.length / 10) === 0 || i === sliced.length - 1;
            if (!showLabel) return null;
            const label = d.date.slice(5);
            return (
              <text key={`label-${i}`} x={x} y={H - 5} fontSize={9} fill="var(--text-secondary)" textAnchor="middle">
                {label}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoverIdx !== null && sliced[hoverIdx] && (
          <div
            className="absolute bg-surface border border-border rounded-xl shadow-[var(--shadow-md)] px-3 py-2 pointer-events-none z-10"
            style={{
              left: `${((PAD_L + hoverIdx * gap) / W) * 100}%`,
              top: '8px',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-xs font-medium text-text">{sliced[hoverIdx].date}</p>
            <p className="text-xs text-text-secondary">활동 {sliced[hoverIdx].activeStudents}명</p>
            {sliced[hoverIdx].totalAnswers > 0 && (
              <>
                <p className="text-xs text-text-secondary">풀이 {sliced[hoverIdx].totalAnswers}문항</p>
                <p className="text-xs text-primary font-medium">정답률 {sliced[hoverIdx].correctRate}%</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
