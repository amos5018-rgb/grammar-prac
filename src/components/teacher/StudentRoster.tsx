'use client';

import { useState } from 'react';

interface RosterStudent {
  clientId: string;
  name: string;
  studentId: string;
  streak: number;
  masteredCount: number;
  lastSyncedAt: string;
  correctRate: number | null;
  totalAnswers: number;
  riskTags: string[];
}

interface Props {
  roster: RosterStudent[];
  onStudentClick: (clientId: string) => void;
}

type SortKey = 'name' | 'streak' | 'masteredCount' | 'correctRate' | 'lastSyncedAt';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

const RISK_BADGES: Record<string, { icon: string; color: string }> = {
  inactive: { icon: '🔴', color: 'text-error' },
  'low-mastery': { icon: '🟠', color: 'text-warning' },
  struggling: { icon: '🟡', color: 'text-warning' },
};

export default function StudentRoster({ roster, onStudentClick }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState('');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'name');
    }
  };

  const filtered = search
    ? roster.filter(s => s.name.includes(search) || s.studentId.includes(search))
    : roster;

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'streak': cmp = a.streak - b.streak; break;
      case 'masteredCount': cmp = a.masteredCount - b.masteredCount; break;
      case 'correctRate': cmp = (a.correctRate ?? -1) - (b.correctRate ?? -1); break;
      case 'lastSyncedAt': cmp = a.lastSyncedAt.localeCompare(b.lastSyncedAt); break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const SortHeader = ({ label, k, className }: { label: string; k: SortKey; className?: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`text-xs font-medium text-text-secondary hover:text-text transition-colors flex items-center gap-0.5 ${className ?? ''}`}
    >
      {label}
      {sortKey === k && (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
          {sortAsc
            ? <path d="M6 3L10 8H2L6 3Z" />
            : <path d="M6 9L2 4H10L6 9Z" />
          }
        </svg>
      )}
    </button>
  );

  return (
    <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="px-4 py-3 border-b border-border/70 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-text">학생 명단</h2>
          <p className="text-xs text-text-secondary mt-0.5">{roster.length}명 · 클릭하여 상세 보기</p>
        </div>
        <input
          type="text"
          placeholder="이름/학번 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-text placeholder:text-text-secondary w-36 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Table header */}
      <div className="hidden sm:grid grid-cols-[1fr_60px_60px_70px_70px_40px] gap-2 px-4 py-2 border-b border-border/50 bg-background/50">
        <SortHeader label="이름" k="name" />
        <SortHeader label="스트릭" k="streak" className="justify-center" />
        <SortHeader label="마스터" k="masteredCount" className="justify-center" />
        <SortHeader label="정답률" k="correctRate" className="justify-center" />
        <SortHeader label="최근활동" k="lastSyncedAt" className="justify-center" />
        <span className="text-xs text-text-secondary text-center">상태</span>
      </div>

      <div className="divide-y divide-border/50 max-h-[480px] overflow-y-auto">
        {sorted.map(s => (
          <button
            key={s.clientId}
            onClick={() => onStudentClick(s.clientId)}
            className="w-full text-left px-4 py-2.5 hover:bg-background/50 transition-colors sm:grid sm:grid-cols-[1fr_60px_60px_70px_70px_40px] sm:gap-2 sm:items-center"
          >
            {/* Mobile: stacked layout */}
            <div className="sm:hidden flex items-center justify-between mb-1">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">{s.name}</p>
                <p className="text-xs text-text-secondary">{s.studentId}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {s.riskTags.map(tag => {
                  const b = RISK_BADGES[tag];
                  return b ? <span key={tag} className="text-xs">{b.icon}</span> : null;
                })}
              </div>
            </div>
            <div className="sm:hidden flex items-center gap-3 text-xs text-text-secondary">
              <span>🔥 {s.streak}일</span>
              <span>👑 {s.masteredCount}개</span>
              <span>정답률 {s.correctRate !== null ? `${s.correctRate}%` : '-'}</span>
              <span>{relativeTime(s.lastSyncedAt)}</span>
            </div>

            {/* Desktop: grid layout */}
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-medium text-text truncate">{s.name}</p>
              <p className="text-xs text-text-secondary">{s.studentId}</p>
            </div>
            <p className="hidden sm:block text-sm text-center tabular-nums text-text">{s.streak}일</p>
            <p className="hidden sm:block text-sm text-center tabular-nums text-text">{s.masteredCount}개</p>
            <p className={`hidden sm:block text-sm text-center tabular-nums font-medium ${
              s.correctRate === null ? 'text-text-secondary' :
              s.correctRate < 50 ? 'text-error' :
              s.correctRate < 70 ? 'text-warning' : 'text-success'
            }`}>
              {s.correctRate !== null ? `${s.correctRate}%` : '-'}
            </p>
            <p className="hidden sm:block text-xs text-center text-text-secondary">{relativeTime(s.lastSyncedAt)}</p>
            <div className="hidden sm:flex justify-center gap-0.5">
              {s.riskTags.map(tag => {
                const b = RISK_BADGES[tag];
                return b ? <span key={tag} className="text-xs">{b.icon}</span> : null;
              })}
            </div>
          </button>
        ))}

        {sorted.length === 0 && (
          <p className="text-sm text-text-secondary text-center py-6">
            {search ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
          </p>
        )}
      </div>
    </div>
  );
}
