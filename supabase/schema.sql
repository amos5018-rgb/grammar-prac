-- ============================================================
-- 교사 대시보드용 Supabase 스키마
-- Supabase 프로젝트 → SQL Editor에 전체 붙여넣고 실행하세요.
-- ============================================================

-- 학생(기기) 스냅샷: 기기당 1행
create table if not exists public.students (
  client_id      uuid primary key,
  name           text not null,
  student_id     text not null,
  streak         int  not null default 0,
  activity_dates text[] not null default '{}',
  unit_tiers     jsonb not null default '{}',
  unit_progress  jsonb not null default '{}',
  last_synced_at timestamptz not null default now(),
  created_at     timestamptz not null default now()
);
create index if not exists students_student_id_idx on public.students (student_id);

-- 문항 단위 기록 (정답률 집계용)
create table if not exists public.answers (
  id             bigint generated always as identity primary key,
  client_id      uuid not null references public.students(client_id) on delete cascade,
  attempt_id     text not null,
  question_id    text not null,
  unit_code      text not null,
  question_text  text not null default '',
  correct        boolean not null,
  student_answer text,
  correct_answer text,
  answered_at    timestamptz not null,
  unique (client_id, attempt_id, question_id)
);
create index if not exists answers_unit_code_idx   on public.answers (unit_code);
create index if not exists answers_question_id_idx on public.answers (question_id);
create index if not exists answers_client_id_idx   on public.answers (client_id);

-- RLS 활성화 + 정책 없음 → anon 키는 접근 불가, service-role만 우회
alter table public.students enable row level security;
alter table public.answers  enable row level security;

-- 단원별 정답률 (낮은 순) + 참여 학생 수
create or replace view public.v_unit_rates as
select unit_code,
       count(*) as total_answers,
       sum(case when correct then 1 else 0 end) as correct_answers,
       round(100.0 * sum(case when correct then 1 else 0 end) / count(*), 1) as correct_rate,
       count(distinct client_id) as student_count
from public.answers
group by unit_code
order by correct_rate asc;

-- 일별 추이 쿼리 성능용 인덱스
create index if not exists answers_answered_at_idx on public.answers (answered_at);

-- 문항별 정답률 (어려운 순)
create or replace view public.v_question_rates as
select question_id,
       max(unit_code)     as unit_code,
       max(question_text) as question_text,
       count(*) as attempts,
       sum(case when correct then 1 else 0 end) as correct_count,
       round(100.0 * sum(case when correct then 1 else 0 end) / count(*), 1) as correct_rate
from public.answers
group by question_id
order by correct_rate asc;

-- ============================================================
-- Deep Analytics: 세션, 모드 선택, 문항 진단, 행동 로그, 추천 효과
-- 학생 화면에서는 로컬 큐에만 빠르게 저장하고, 집계는 Supabase view에서 수행합니다.
-- ============================================================

create table if not exists public.attempt_sessions (
  attempt_id   text primary key,
  client_id    uuid not null references public.students(client_id) on delete cascade,
  unit_code    text not null,
  mode         text not null default 'unknown',
  started_at   timestamptz not null,
  completed_at timestamptz not null,
  duration_ms  int not null default 0,
  score        int not null default 0,
  total        int not null default 0,
  completed    boolean not null default false,
  exit_reason  text not null default ''
);
create index if not exists attempt_sessions_client_idx on public.attempt_sessions (client_id);
create index if not exists attempt_sessions_unit_idx on public.attempt_sessions (unit_code);
create index if not exists attempt_sessions_mode_idx on public.attempt_sessions (mode);
create index if not exists attempt_sessions_started_idx on public.attempt_sessions (started_at);

create table if not exists public.mode_selection_events (
  event_id                 text primary key,
  client_id                uuid not null references public.students(client_id) on delete cascade,
  selected_at              timestamptz not null,
  source_screen            text not null default '',
  source_component         text not null default '',
  selected_mode            text not null default 'unknown',
  unit_code                text,
  category_code            text,
  block_code               text,
  requested_count          int,
  available_modes          text[] not null default '{}',
  available_question_count int,
  wrong_count_available    int,
  due_count_available      int,
  unit_attempts            int,
  unit_best_score          int,
  unit_tier                text,
  coverage_pct             int
);
create index if not exists mode_selection_client_idx on public.mode_selection_events (client_id);
create index if not exists mode_selection_selected_idx on public.mode_selection_events (selected_at);
create index if not exists mode_selection_mode_idx on public.mode_selection_events (selected_mode);
create index if not exists mode_selection_unit_idx on public.mode_selection_events (unit_code);

create table if not exists public.answer_metrics (
  id                  bigint generated always as identity primary key,
  client_id           uuid not null references public.students(client_id) on delete cascade,
  attempt_id          text not null,
  question_id         text not null,
  unit_code           text not null,
  question_type       text not null default '',
  difficulty          text not null default '',
  block               text,
  question_order      int not null default 0,
  correct             boolean not null default false,
  student_answer      text,
  correct_answer      text,
  response_ms         int not null default 0,
  first_action_ms     int,
  feedback_dwell_ms   int not null default 0,
  answer_change_count int not null default 0,
  selection_count     int not null default 0,
  unique (client_id, attempt_id, question_id)
);
create index if not exists answer_metrics_question_idx on public.answer_metrics (question_id);
create index if not exists answer_metrics_unit_idx on public.answer_metrics (unit_code);
create index if not exists answer_metrics_client_idx on public.answer_metrics (client_id);
create index if not exists answer_metrics_attempt_idx on public.answer_metrics (attempt_id);

create table if not exists public.quiz_events (
  event_id    text primary key,
  client_id   uuid not null references public.students(client_id) on delete cascade,
  attempt_id  text not null,
  question_id text,
  event_type  text not null,
  event_at    timestamptz not null,
  elapsed_ms  int not null default 0,
  payload     jsonb not null default '{}'
);
create index if not exists quiz_events_client_idx on public.quiz_events (client_id);
create index if not exists quiz_events_attempt_idx on public.quiz_events (attempt_id);
create index if not exists quiz_events_type_idx on public.quiz_events (event_type);
create index if not exists quiz_events_at_idx on public.quiz_events (event_at);

create table if not exists public.recommendation_events (
  event_id            text primary key,
  client_id           uuid not null references public.students(client_id) on delete cascade,
  recommendation_type text not null default '',
  href                text not null default '',
  shown_at            timestamptz not null,
  clicked             boolean not null default false,
  clicked_at          timestamptz,
  led_to_mode         text,
  urgent              boolean not null default false,
  dday                int
);
create index if not exists recommendation_events_client_idx on public.recommendation_events (client_id);
create index if not exists recommendation_events_type_idx on public.recommendation_events (recommendation_type);
create index if not exists recommendation_events_shown_idx on public.recommendation_events (shown_at);

alter table public.attempt_sessions enable row level security;
alter table public.mode_selection_events enable row level security;
alter table public.answer_metrics enable row level security;
alter table public.quiz_events enable row level security;
alter table public.recommendation_events enable row level security;

create or replace view public.v_mode_preference_by_student as
select
  e.client_id,
  max(s.name) as name,
  max(s.student_id) as student_id,
  count(*) as selections,
  count(*) filter (where e.selected_mode in ('unit_random_5','unit_random_10','block_random_5','category_mixed_10','review_random')) as random_count,
  count(*) filter (where e.selected_mode in ('unit_full','block_full')) as full_count,
  count(*) filter (where e.selected_mode like 'review_%') as review_count,
  count(*) filter (where e.selected_mode = 'category_mixed_10') as mixed_count,
  round(100.0 * count(*) filter (where e.selected_mode in ('unit_random_5','unit_random_10','block_random_5','category_mixed_10','review_random')) / nullif(count(*), 0), 1) as random_rate,
  round(100.0 * count(*) filter (where e.selected_mode in ('unit_full','block_full')) / nullif(count(*), 0), 1) as full_rate,
  round(100.0 * count(*) filter (where e.selected_mode like 'review_%') / nullif(count(*), 0), 1) as review_rate,
  round(avg(e.coverage_pct), 1) as avg_coverage_pct,
  max(e.selected_at) as last_selected_at
from public.mode_selection_events e
left join public.students s on s.client_id = e.client_id
group by e.client_id
order by selections desc;

create or replace view public.v_mode_preference_by_unit as
select
  coalesce(e.unit_code, e.category_code, 'unknown') as scope_code,
  case when e.unit_code is not null then 'unit'
       when e.category_code is not null then 'category'
       else 'unknown' end as scope_type,
  count(*) as selections,
  count(distinct e.client_id) as student_count,
  count(*) filter (where e.selected_mode in ('unit_random_5','unit_random_10','block_random_5','category_mixed_10','review_random')) as random_count,
  count(*) filter (where e.selected_mode in ('unit_full','block_full')) as full_count,
  count(*) filter (where e.selected_mode like 'review_%') as review_count,
  round(100.0 * count(*) filter (where e.selected_mode in ('unit_random_5','unit_random_10','block_random_5','category_mixed_10','review_random')) / nullif(count(*), 0), 1) as random_rate,
  round(100.0 * count(*) filter (where e.selected_mode in ('unit_full','block_full')) / nullif(count(*), 0), 1) as full_rate,
  round(avg(e.wrong_count_available), 1) as avg_wrong_available,
  round(avg(e.coverage_pct), 1) as avg_coverage_pct
from public.mode_selection_events e
group by coalesce(e.unit_code, e.category_code, 'unknown'),
         case when e.unit_code is not null then 'unit'
              when e.category_code is not null then 'category'
              else 'unknown' end
order by selections desc;

create or replace view public.v_mode_opportunity_rates as
select
  offered_mode,
  e.source_screen,
  e.source_component,
  count(*) as offered_count,
  count(*) filter (where e.selected_mode = offered_mode) as selected_count,
  round(100.0 * count(*) filter (where e.selected_mode = offered_mode) / nullif(count(*), 0), 1) as selected_rate,
  round(avg(e.available_question_count), 1) as avg_available_questions,
  round(avg(e.wrong_count_available), 1) as avg_wrong_available,
  round(avg(e.due_count_available), 1) as avg_due_available
from public.mode_selection_events e
cross join lateral unnest(e.available_modes) as offered(offered_mode)
group by offered_mode, e.source_screen, e.source_component
order by selected_rate desc nulls last, offered_count desc;

create or replace view public.v_review_trigger_patterns as
select
  e.source_screen,
  e.source_component,
  e.selected_mode,
  count(*) as selections,
  count(distinct e.client_id) as student_count,
  round(avg(e.wrong_count_available), 1) as avg_wrong_available,
  round(avg(e.due_count_available), 1) as avg_due_available,
  round(avg(e.unit_best_score), 1) as avg_unit_best_score,
  round(avg(e.coverage_pct), 1) as avg_coverage_pct
from public.mode_selection_events e
where e.selected_mode like 'review_%'
group by e.source_screen, e.source_component, e.selected_mode
order by selections desc;

create or replace view public.v_random_vs_full_outcomes as
with classified as (
  select
    *,
    case
      when mode in ('unit_random_5','unit_random_10','block_random_5','category_mixed_10','review_random') then 'random'
      when mode in ('unit_full','block_full') then 'full'
      when mode like 'review_%' then 'review'
      when mode = 'study_cards' then 'study'
      else 'other'
    end as mode_family
  from public.attempt_sessions
)
select
  mode_family,
  count(*) as sessions,
  count(distinct client_id) as student_count,
  round(avg(case when total > 0 then 100.0 * score / total else null end), 1) as avg_score_rate,
  round(100.0 * count(*) filter (where completed) / nullif(count(*), 0), 1) as completion_rate,
  round(100.0 * count(*) filter (where not completed) / nullif(count(*), 0), 1) as exit_rate,
  round(avg(duration_ms), 0) as avg_duration_ms
from classified
group by mode_family
order by sessions desc;

create or replace view public.v_recommendation_effectiveness as
select
  recommendation_type,
  coalesce(led_to_mode, 'unknown') as led_to_mode,
  count(*) filter (where not clicked) as shown_count,
  count(*) filter (where clicked) as clicked_count,
  round(100.0 * count(*) filter (where clicked) / nullif(count(*) filter (where not clicked), 0), 1) as click_rate,
  count(distinct client_id) as student_count,
  count(*) filter (where urgent) as urgent_events,
  round(avg(dday), 1) as avg_dday
from public.recommendation_events
group by recommendation_type, coalesce(led_to_mode, 'unknown')
order by clicked_count desc, shown_count desc;

create or replace view public.v_session_transition_patterns as
with ordered as (
  select
    client_id,
    mode as from_mode,
    lead(mode) over (partition by client_id order by started_at) as to_mode,
    completed,
    case when total > 0 then 100.0 * score / total else null end as score_rate
  from public.attempt_sessions
)
select
  from_mode,
  to_mode,
  count(*) as transitions,
  round(avg(score_rate), 1) as avg_from_score_rate,
  round(100.0 * count(*) filter (where completed) / nullif(count(*), 0), 1) as from_completion_rate
from ordered
where to_mode is not null
group by from_mode, to_mode
order by transitions desc;

create or replace view public.v_question_diagnostics as
select
  question_id,
  max(unit_code) as unit_code,
  max(question_type) as question_type,
  max(difficulty) as difficulty,
  max(block) as block,
  count(*) as attempts,
  sum(case when correct then 1 else 0 end) as correct_count,
  round(100.0 * sum(case when correct then 1 else 0 end) / nullif(count(*), 0), 1) as correct_rate,
  round(avg(response_ms), 0) as avg_response_ms,
  round(avg(first_action_ms), 0) as avg_first_action_ms,
  round(avg(feedback_dwell_ms), 0) as avg_feedback_dwell_ms,
  round(avg(answer_change_count), 1) as avg_answer_change_count,
  round(avg(selection_count), 1) as avg_selection_count
from public.answer_metrics
group by question_id
order by correct_rate asc nulls last, avg_response_ms desc nulls last;
