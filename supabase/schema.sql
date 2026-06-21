-- ============================================================
-- 교사 대시보드용 Supabase 스키마
-- Supabase 프로젝트 → SQL Editor에 전체 붙여넣고 실행하세요.
-- ============================================================

-- 학생(기기) 스냅샷: 기기당 1행
create table if not exists public.students (
  client_id         uuid primary key,
  name              text not null,
  student_id        text not null,
  streak            int  not null default 0,
  activity_dates    text[] not null default '{}',
  unit_tiers        jsonb not null default '{}',
  unit_progress     jsonb not null default '{}',
  study_completions jsonb not null default '{}',
  last_synced_at    timestamptz not null default now(),
  created_at        timestamptz not null default now()
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
  quiz_mode      text,
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

-- quiz_mode 인덱스
create index if not exists answers_quiz_mode_idx on public.answers (quiz_mode);

-- 일별 추이 RPC (최근 N일)
create or replace function public.get_daily_trend(since_date text)
returns table(d text, active_students bigint, total_answers bigint, correct_answers bigint)
language sql stable
as $$
  select
    to_char(answered_at, 'YYYY-MM-DD') as d,
    count(distinct client_id) as active_students,
    count(*) as total_answers,
    sum(case when correct then 1 else 0 end)::bigint as correct_answers
  from public.answers
  where answered_at >= since_date::date
  group by d
  order by d;
$$;

-- 학생별 정답률 RPC
create or replace function public.get_per_student_rates()
returns table(client_id uuid, total bigint, correct bigint)
language sql stable
as $$
  select
    client_id,
    count(*) as total,
    sum(case when correct then 1 else 0 end)::bigint as correct
  from public.answers
  group by client_id;
$$;

-- 모드별 사용 통계 뷰
create or replace view public.v_mode_usage as
select
  coalesce(quiz_mode, 'unknown') as quiz_mode,
  count(distinct attempt_id || '|' || client_id::text) as session_count,
  count(distinct client_id) as student_count,
  count(*) as total_answers,
  sum(case when correct then 1 else 0 end) as correct_answers,
  round(100.0 * sum(case when correct then 1 else 0 end) / nullif(count(*), 0), 1) as correct_rate
from public.answers
group by quiz_mode
order by session_count desc;

-- 학생×모드별 정답률 (모드 효과 분석용)
create or replace view public.v_student_mode_rates as
select
  client_id,
  coalesce(quiz_mode, 'unknown') as quiz_mode,
  count(distinct attempt_id) as session_count,
  count(*) as total_answers,
  sum(case when correct then 1 else 0 end) as correct_answers,
  round(100.0 * sum(case when correct then 1 else 0 end) / nullif(count(*), 0), 1) as correct_rate
from public.answers
group by client_id, quiz_mode;
