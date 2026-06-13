import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

// 페이로드 크기 제한 (남용 방지)
const MAX_ATTEMPTS = 2000;
const MAX_ANSWERS_PER_ATTEMPT = 100;

function isUuid(s: unknown): s is string {
  return typeof s === 'string' && /^[0-9a-f-]{8,64}$/i.test(s);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // 환경변수 미설정: 조용히 성공 처리 (학생 흐름 영향 없음)
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const clientId = b.clientId;
  const profile = b.profile as { name?: string; studentId?: string } | undefined;

  if (!isUuid(clientId) || !profile || typeof profile.name !== 'string' || typeof profile.studentId !== 'string') {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  const attempts = Array.isArray(b.attempts) ? b.attempts.slice(0, MAX_ATTEMPTS) : [];

  // 1) students 스냅샷 upsert
  const { error: studentErr } = await supabase.from('students').upsert(
    {
      client_id: clientId,
      name: profile.name.slice(0, 100),
      student_id: profile.studentId.slice(0, 50),
      streak: typeof b.streak === 'number' ? b.streak : 0,
      activity_dates: Array.isArray(b.activityDates) ? b.activityDates : [],
      unit_tiers: b.unitTiers ?? {},
      unit_progress: b.unitProgress ?? {},
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: 'client_id' },
  );

  if (studentErr) {
    return NextResponse.json({ error: 'student upsert failed' }, { status: 500 });
  }

  // 2) answers 행 평탄화 후 멱등 upsert
  type AnswerRow = {
    client_id: string;
    attempt_id: string;
    question_id: string;
    unit_code: string;
    question_text: string;
    correct: boolean;
    student_answer: string;
    correct_answer: string;
    answered_at: string;
  };

  const rows: AnswerRow[] = [];
  for (const att of attempts as Array<Record<string, unknown>>) {
    const attemptId = att.attemptId;
    const unitCode = att.unitCode;
    const date = att.date;
    if (typeof attemptId !== 'string' || typeof unitCode !== 'string' || typeof date !== 'string') continue;
    const answers = Array.isArray(att.answers) ? att.answers.slice(0, MAX_ANSWERS_PER_ATTEMPT) : [];
    for (const a of answers as Array<Record<string, unknown>>) {
      if (typeof a.questionId !== 'string') continue;
      rows.push({
        client_id: clientId,
        attempt_id: attemptId,
        question_id: a.questionId,
        unit_code: typeof a.unitCode === 'string' ? a.unitCode : unitCode,
        question_text: typeof a.questionText === 'string' ? a.questionText.slice(0, 1000) : '',
        correct: a.correct === true,
        student_answer: typeof a.studentAnswer === 'string' ? a.studentAnswer.slice(0, 500) : '',
        correct_answer: typeof a.correctAnswer === 'string' ? a.correctAnswer.slice(0, 500) : '',
        answered_at: date,
      });
    }
  }

  if (rows.length > 0) {
    // 큰 배치는 나눠서 upsert (멱등키로 중복 무시)
    const CHUNK = 1000;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const { error: ansErr } = await supabase
        .from('answers')
        .upsert(rows.slice(i, i + CHUNK), {
          onConflict: 'client_id,attempt_id,question_id',
          ignoreDuplicates: true,
        });
      if (ansErr) {
        return NextResponse.json({ error: 'answers upsert failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true, answers: rows.length });
}
