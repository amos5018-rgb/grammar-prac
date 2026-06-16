'use client';

import { useState } from 'react';

interface RosterStudent {
  clientId: string;
  name: string;
  studentId: string;
  correctRate: number | null;
  totalAnswers: number;
  masteredCount: number;
  riskTags: string[];
  inactiveDays: number | null;
}

interface Props {
  roster: RosterStudent[];
  onStudentClick: (clientId: string) => void;
}

const RISK_CONFIG: Record<string, { icon: string; color: string; bg: string; label: (s: RosterStudent) => string }> = {
  inactive: {
    icon: '🔴',
    color: 'text-error',
    bg: 'bg-error-light',
    label: (s) => `${s.inactiveDays ?? '?'}일째 미접속`,
  },
  'low-mastery': {
    icon: '🟠',
    color: 'text-warning',
    bg: 'bg-warning-light',
    label: (s) => `마스터 ${s.masteredCount}개만 달성`,
  },
  struggling: {
    icon: '🟡',
    color: 'text-warning',
    bg: 'bg-warning-light',
    label: (s) => `정답률 ${s.correctRate ?? 0}% (${s.totalAnswers}회)`,
  },
};

export default function AtRiskList({ roster, onStudentClick }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const atRisk = roster.filter(s => s.riskTags.length > 0);
  if (atRisk.length === 0) return null;

  // Sort by number of risk tags (most urgent first), then by name
  const sorted = [...atRisk].sort((a, b) => b.riskTags.length - a.riskTags.length || a.name.localeCompare(b.name));

  return (
    <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-4 py-3 flex items-center justify-between border-b border-border/70 hover:bg-background/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <h2 className="font-bold text-text">주의 학생</h2>
          <span className="text-xs text-text-secondary bg-background px-2 py-0.5 rounded-full">{atRisk.length}명</span>
        </div>
        <svg className={`w-4 h-4 text-text-secondary transition-transform ${collapsed ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="divide-y divide-border/50">
          {sorted.map(s => (
            <button
              key={s.clientId}
              onClick={() => onStudentClick(s.clientId)}
              className="w-full text-left px-4 py-3 hover:bg-background/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-text truncate">{s.name}</p>
                <span className="text-xs text-text-secondary shrink-0">{s.studentId}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {s.riskTags.map(tag => {
                  const cfg = RISK_CONFIG[tag];
                  if (!cfg) return null;
                  return (
                    <span key={tag} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      <span>{cfg.icon}</span>
                      {cfg.label(s)}
                    </span>
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
