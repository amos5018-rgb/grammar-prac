-- 기존 Supabase 프로젝트에 분석 기능 추가 마이그레이션
-- SQL Editor에서 실행하세요.

-- 1) students 테이블에 인출 연습 기록 컬럼 추가
alter table public.students
  add column if not exists study_completions jsonb not null default '{}';

-- 2) answers 테이블에 퀴즈 모드 컬럼 추가
alter table public.answers
  add column if not exists quiz_mode text;

create index if not exists answers_quiz_mode_idx on public.answers (quiz_mode);

-- 3) 일별 추이 RPC
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

-- 4) 학생별 정답률 RPC
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

-- 5) 모드별 사용 통계 뷰
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

-- 6) 학생×모드별 정답률 뷰
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
