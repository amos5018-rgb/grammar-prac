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
