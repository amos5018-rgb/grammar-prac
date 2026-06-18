'use client';

import type { ReactNode } from 'react';
import { UNIT_NAMES } from '@/data/unitNames';

export interface ModeByStudentRow {
  client_id: string;
  name: string | null;
  student_id: string | null;
  selections: number;
  random_count: number;
  full_count: number;
  review_count: number;
  mixed_count: number;
  random_rate: number | null;
  full_rate: number | null;
  review_rate: number | null;
  avg_coverage_pct: number | null;
  last_selected_at: string | null;
}

export interface ModeByUnitRow {
  scope_code: string;
  scope_type: string;
  selections: number;
  student_count: number;
  random_count: number;
  full_count: number;
  review_count: number;
  random_rate: number | null;
  full_rate: number | null;
  avg_wrong_available: number | null;
  avg_coverage_pct: number | null;
}

export interface OpportunityRow {
  offered_mode: string;
  source_screen: string;
  source_component: string;
  offered_count: number;
  selected_count: number;
  selected_rate: number | null;
  avg_available_questions: number | null;
  avg_wrong_available: number | null;
  avg_due_available: number | null;
}

export interface ReviewTriggerRow {
  source_screen: string;
  source_component: string;
  selected_mode: string;
  selections: number;
  student_count: number;
  avg_wrong_available: number | null;
  avg_due_available: number | null;
  avg_unit_best_score: number | null;
  avg_coverage_pct: number | null;
}

export interface RandomVsFullRow {
  mode_family: string;
  sessions: number;
  student_count: number;
  avg_score_rate: number | null;
  completion_rate: number | null;
  exit_rate: number | null;
  avg_duration_ms: number | null;
}

export interface RecommendationEffectivenessRow {
  recommendation_type: string;
  led_to_mode: string;
  shown_count: number;
  clicked_count: number;
  click_rate: number | null;
  student_count: number;
  urgent_events: number;
  avg_dday: number | null;
}

export interface SessionTransitionRow {
  from_mode: string;
  to_mode: string;
  transitions: number;
  avg_from_score_rate: number | null;
  from_completion_rate: number | null;
}

export interface QuestionDiagnosticRow {
  question_id: string;
  unit_code: string;
  question_type: string;
  difficulty: string;
  block: string | null;
  attempts: number;
  correct_count: number;
  correct_rate: number | null;
  avg_response_ms: number | null;
  avg_first_action_ms: number | null;
  avg_feedback_dwell_ms: number | null;
  avg_answer_change_count: number | null;
  avg_selection_count: number | null;
}

export interface PatternStats {
  modeByStudent: ModeByStudentRow[];
  modeByUnit: ModeByUnitRow[];
  opportunityRates: OpportunityRow[];
  reviewTriggers: ReviewTriggerRow[];
  randomVsFullOutcomes: RandomVsFullRow[];
  recommendationEffectiveness: RecommendationEffectivenessRow[];
  sessionTransitions: SessionTransitionRow[];
  questionDiagnostics: QuestionDiagnosticRow[];
}

const MODE_LABELS: Record<string, string> = {
  unit_full: '단원 전부',
  unit_random_5: '단원 랜덤 5',
  unit_random_10: '단원 랜덤 10',
  block_full: '블록 전부',
  block_random_5: '블록 랜덤 5',
  category_mixed_10: '영역 섞어풀기',
  review_all: '오답 전체',
  review_random: '오답 랜덤',
  review_due: '간격 복습',
  review_wrong_top: '상위 오답',
  review_unit: '단원 오답',
  review_block: '블록 오답',
  study_cards: '학습 카드',
  random: '랜덤 계열',
  full: '전부 풀이',
  review: '오답 복습',
  study: '학습 카드',
  other: '기타',
  unknown: '알 수 없음',
};

function labelMode(mode: string) {
  return MODE_LABELS[mode] ?? mode;
}

function labelScope(code: string) {
  return UNIT_NAMES[code] ?? code;
}

function pct(value: number | null | undefined) {
  return value == null ? '-' : `${value}%`;
}

function count(value: number | null | undefined) {
  return value == null ? '-' : value.toLocaleString('ko-KR');
}

function seconds(ms: number | null | undefined) {
  if (ms == null) return '-';
  return `${Math.round(ms / 100) / 10}초`;
}

function EmptyState() {
  return (
    <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-8 text-center">
      <p className="text-sm font-medium text-text">아직 패턴 데이터가 없습니다.</p>
      <p className="text-xs text-text-secondary mt-1">학생들이 새 버전에서 문제를 풀고 동기화하면 이 탭이 채워집니다.</p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="px-4 py-3 border-b border-border/70">
        <h2 className="font-bold text-text">{title}</h2>
        <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-4">
      <p className="text-2xl font-bold tabular-nums text-text">{value}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
      <p className="text-[11px] text-text-secondary mt-1">{sub}</p>
    </div>
  );
}

function MiniBar({ value }: { value: number | null | undefined }) {
  const width = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full" style={{ width: `${width}%` }} />
    </div>
  );
}

export default function PatternInsights({ patterns }: { patterns: PatternStats }) {
  const hasData = Object.values(patterns).some(rows => rows.length > 0);
  if (!hasData) return <EmptyState />;

  const totalSelections = patterns.modeByStudent.reduce((sum, row) => sum + row.selections, 0);
  const randomCount = patterns.modeByStudent.reduce((sum, row) => sum + row.random_count, 0);
  const fullCount = patterns.modeByStudent.reduce((sum, row) => sum + row.full_count, 0);
  const reviewCount = patterns.modeByStudent.reduce((sum, row) => sum + row.review_count, 0);
  const shown = patterns.recommendationEffectiveness.reduce((sum, row) => sum + row.shown_count, 0);
  const clicked = patterns.recommendationEffectiveness.reduce((sum, row) => sum + row.clicked_count, 0);
  const randomShare = totalSelections > 0 ? Math.round((randomCount / totalSelections) * 1000) / 10 : null;
  const fullShare = totalSelections > 0 ? Math.round((fullCount / totalSelections) * 1000) / 10 : null;
  const reviewShare = totalSelections > 0 ? Math.round((reviewCount / totalSelections) * 1000) / 10 : null;
  const recClickRate = shown > 0 ? Math.round((clicked / shown) * 1000) / 10 : null;

  const randomHeavyStudents = [...patterns.modeByStudent]
    .filter(row => row.selections >= 3)
    .sort((a, b) => (b.random_rate ?? 0) - (a.random_rate ?? 0))
    .slice(0, 5);
  const fullAvoidanceUnits = [...patterns.modeByUnit]
    .filter(row => row.selections >= 2)
    .sort((a, b) => (a.full_rate ?? 0) - (b.full_rate ?? 0) || (b.random_rate ?? 0) - (a.random_rate ?? 0))
    .slice(0, 5);
  const slowQuestions = [...patterns.questionDiagnostics]
    .filter(row => row.attempts >= 2)
    .sort((a, b) => (b.avg_response_ms ?? 0) - (a.avg_response_ms ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="랜덤 풀이 점유율" value={pct(randomShare)} sub={`${count(randomCount)} / ${count(totalSelections)} 선택`} />
        <MetricCard label="전부 풀이 도전율" value={pct(fullShare)} sub={`${count(fullCount)}회 선택`} />
        <MetricCard label="오답 복습 전환율" value={pct(reviewShare)} sub={`${count(reviewCount)}회 선택`} />
        <MetricCard label="추천 카드 반응률" value={pct(recClickRate)} sub={`${count(clicked)} / ${count(shown)} 클릭`} />
      </div>

      <Section title="모드 선호" subtitle="학생별·단원별 랜덤, 전부 풀이, 오답 복습 선택 비율">
        <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-border/60">
          <div className="divide-y divide-border/50">
            <div className="px-4 py-2.5 bg-background/50">
              <p className="text-xs font-bold text-text-secondary">랜덤 의존 학생</p>
            </div>
            {randomHeavyStudents.length === 0 ? (
              <p className="px-4 py-4 text-sm text-text-secondary">아직 뚜렷한 학생 패턴이 없습니다.</p>
            ) : randomHeavyStudents.map(row => (
              <div key={row.client_id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <p className="text-sm font-medium text-text truncate">{row.name ?? row.student_id ?? row.client_id}</p>
                  <span className="text-sm font-bold tabular-nums text-primary">{pct(row.random_rate)}</span>
                </div>
                <MiniBar value={row.random_rate} />
                <p className="text-xs text-text-secondary mt-1">전부 {pct(row.full_rate)} · 오답 {pct(row.review_rate)} · {row.selections}회 선택</p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-border/50">
            <div className="px-4 py-2.5 bg-background/50">
              <p className="text-xs font-bold text-text-secondary">전부 풀이 회피 단원</p>
            </div>
            {fullAvoidanceUnits.length === 0 ? (
              <p className="px-4 py-4 text-sm text-text-secondary">아직 단원별 선호를 판단하기 어렵습니다.</p>
            ) : fullAvoidanceUnits.map(row => (
              <div key={`${row.scope_type}-${row.scope_code}`} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <p className="text-sm font-medium text-text truncate">{labelScope(row.scope_code)}</p>
                  <span className="text-sm font-bold tabular-nums text-warning">{pct(row.full_rate)}</span>
                </div>
                <MiniBar value={row.full_rate} />
                <p className="text-xs text-text-secondary mt-1">랜덤 {pct(row.random_rate)} · 오답 {row.review_count}회 · {row.student_count}명</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="오답 복습 사용 패턴" subtitle="어떤 화면과 상황에서 오답 복습이 선택되는지">
        <div className="divide-y divide-border/50">
          {patterns.reviewTriggers.length === 0 ? (
            <p className="px-4 py-4 text-sm text-text-secondary">오답 복습 선택 기록이 아직 없습니다.</p>
          ) : patterns.reviewTriggers.slice(0, 8).map(row => (
            <div key={`${row.source_screen}-${row.source_component}-${row.selected_mode}`} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">{labelMode(row.selected_mode)}</p>
                <p className="text-xs text-text-secondary mt-0.5">{row.source_screen} · {row.source_component}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold tabular-nums text-text">{row.selections}회</p>
                <p className="text-xs text-text-secondary">오답 평균 {count(row.avg_wrong_available)} · 예정 {count(row.avg_due_available)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="추천 효과" subtitle="추천 카드 노출, 클릭, 클릭 후 이어진 모드">
        <div className="divide-y divide-border/50">
          {patterns.recommendationEffectiveness.length === 0 ? (
            <p className="px-4 py-4 text-sm text-text-secondary">추천 카드 데이터가 아직 없습니다.</p>
          ) : patterns.recommendationEffectiveness.slice(0, 8).map(row => (
            <div key={`${row.recommendation_type}-${row.led_to_mode}`} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <p className="text-sm font-medium text-text truncate">{row.recommendation_type} → {labelMode(row.led_to_mode)}</p>
                <span className="text-sm font-bold tabular-nums text-primary">{pct(row.click_rate)}</span>
              </div>
              <MiniBar value={row.click_rate} />
              <p className="text-xs text-text-secondary mt-1">노출 {count(row.shown_count)} · 클릭 {count(row.clicked_count)} · 시험 임박 {count(row.urgent_events)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="학습 루프" subtitle="한 세션 뒤 다음 행동으로 이어지는 흐름">
        <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-border/60">
          <div className="divide-y divide-border/50">
            <div className="px-4 py-2.5 bg-background/50">
              <p className="text-xs font-bold text-text-secondary">모드별 결과</p>
            </div>
            {patterns.randomVsFullOutcomes.length === 0 ? (
              <p className="px-4 py-4 text-sm text-text-secondary">완료된 풀이 세션이 아직 없습니다.</p>
            ) : patterns.randomVsFullOutcomes.map(row => (
              <div key={row.mode_family} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-text">{labelMode(row.mode_family)}</p>
                  <span className="text-sm font-bold tabular-nums text-text">{row.sessions}회</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">평균 {pct(row.avg_score_rate)} · 완료 {pct(row.completion_rate)} · 중도 종료 {pct(row.exit_rate)}</p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-border/50">
            <div className="px-4 py-2.5 bg-background/50">
              <p className="text-xs font-bold text-text-secondary">다음 행동 전환</p>
            </div>
            {patterns.sessionTransitions.length === 0 ? (
              <p className="px-4 py-4 text-sm text-text-secondary">연속 세션 데이터가 아직 없습니다.</p>
            ) : patterns.sessionTransitions.slice(0, 6).map(row => (
              <div key={`${row.from_mode}-${row.to_mode}`} className="px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-text truncate">{labelMode(row.from_mode)} → {labelMode(row.to_mode)}</p>
                <span className="text-sm font-bold tabular-nums text-primary shrink-0">{row.transitions}회</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="문항 진단 신호" subtitle="정답률뿐 아니라 반응 시간과 답 변경 횟수로 보는 문항 부담">
        <div className="divide-y divide-border/50">
          {slowQuestions.length === 0 ? (
            <p className="px-4 py-4 text-sm text-text-secondary">문항별 반응 시간 데이터가 아직 부족합니다.</p>
          ) : slowQuestions.map(row => (
            <div key={row.question_id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">{row.question_id}</p>
                <p className="text-xs text-text-secondary mt-0.5">{labelScope(row.unit_code)} · {row.question_type} · {row.attempts}회</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold tabular-nums text-warning">{seconds(row.avg_response_ms)}</p>
                <p className="text-xs text-text-secondary">정답률 {pct(row.correct_rate)} · 변경 {count(row.avg_answer_change_count)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
