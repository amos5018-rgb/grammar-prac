import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

// 페이로드 크기 제한 (남용 방지)
const MAX_ATTEMPTS = 2000;
const MAX_ANSWERS_PER_ATTEMPT = 100;
const MAX_ANALYTICS_ROWS = 1500;

function isUuid(s: unknown): s is string {
  return typeof s === 'string' && /^[0-9a-f-]{8,64}$/i.test(s);
}

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]*)?$/.test(s) && !isNaN(Date.parse(s));
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
    if (typeof attemptId !== 'string' || typeof unitCode !== 'string' || typeof date !== 'string' || !isIsoDate(date)) continue;
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

  const analytics = (b.analytics && typeof b.analytics === 'object')
    ? b.analytics as Record<string, unknown>
    : {};

  const analyticsCounts = {
    attemptSessions: 0,
    modeSelectionEvents: 0,
    answerMetrics: 0,
    quizEvents: 0,
    recommendationEvents: 0,
  };

  // Analytics는 학생 흐름 보조 데이터이므로, 스키마 미적용/일시 오류가 있어도
  // 기존 학생·정답 동기화를 실패시키지 않는다.
  try {
    const attemptSessions = Array.isArray(analytics.attemptSessions)
      ? analytics.attemptSessions.slice(0, MAX_ANALYTICS_ROWS)
      : [];
    if (attemptSessions.length > 0) {
      const sessionRows = (attemptSessions as Array<Record<string, unknown>>)
        .filter(s => typeof s.attemptId === 'string' && typeof s.unitCode === 'string')
        .map(s => ({
          attempt_id: s.attemptId as string,
          client_id: clientId,
          unit_code: String(s.unitCode),
          mode: typeof s.mode === 'string' ? s.mode : 'unknown',
          started_at: typeof s.startedAt === 'string' && isIsoDate(s.startedAt) ? s.startedAt : new Date().toISOString(),
          completed_at: typeof s.completedAt === 'string' && isIsoDate(s.completedAt) ? s.completedAt : new Date().toISOString(),
          duration_ms: typeof s.durationMs === 'number' ? Math.max(0, Math.round(s.durationMs)) : 0,
          score: typeof s.score === 'number' ? Math.round(s.score) : 0,
          total: typeof s.total === 'number' ? Math.round(s.total) : 0,
          completed: s.completed === true,
          exit_reason: typeof s.exitReason === 'string' ? s.exitReason.slice(0, 80) : '',
        }));
      if (sessionRows.length > 0) {
        const { error } = await supabase.from('attempt_sessions').upsert(sessionRows, {
          onConflict: 'attempt_id',
          ignoreDuplicates: true,
        });
        if (!error) analyticsCounts.attemptSessions = sessionRows.length;
      }
    }

    const modeSelectionEvents = Array.isArray(analytics.modeSelectionEvents)
      ? analytics.modeSelectionEvents.slice(0, MAX_ANALYTICS_ROWS)
      : [];
    if (modeSelectionEvents.length > 0) {
      const modeRows = (modeSelectionEvents as Array<Record<string, unknown>>)
        .filter(e => typeof e.eventId === 'string')
        .map(e => ({
          event_id: e.eventId as string,
          client_id: clientId,
          selected_at: typeof e.selectedAt === 'string' && isIsoDate(e.selectedAt) ? e.selectedAt : new Date().toISOString(),
          source_screen: typeof e.sourceScreen === 'string' ? e.sourceScreen.slice(0, 80) : '',
          source_component: typeof e.sourceComponent === 'string' ? e.sourceComponent.slice(0, 80) : '',
          selected_mode: typeof e.selectedMode === 'string' ? e.selectedMode : 'unknown',
          unit_code: typeof e.unitCode === 'string' ? e.unitCode : null,
          category_code: typeof e.categoryCode === 'string' ? e.categoryCode : null,
          block_code: typeof e.blockCode === 'string' ? e.blockCode : null,
          requested_count: typeof e.requestedCount === 'number' ? Math.round(e.requestedCount) : null,
          available_modes: Array.isArray(e.availableModes) ? e.availableModes : [],
          available_question_count: typeof e.availableQuestionCount === 'number' ? Math.round(e.availableQuestionCount) : null,
          wrong_count_available: typeof e.wrongCountAvailable === 'number' ? Math.round(e.wrongCountAvailable) : null,
          due_count_available: typeof e.dueCountAvailable === 'number' ? Math.round(e.dueCountAvailable) : null,
          unit_attempts: typeof e.unitAttempts === 'number' ? Math.round(e.unitAttempts) : null,
          unit_best_score: typeof e.unitBestScore === 'number' ? Math.round(e.unitBestScore) : null,
          unit_tier: typeof e.unitTier === 'string' ? e.unitTier : null,
          coverage_pct: typeof e.coveragePct === 'number' ? Math.round(e.coveragePct) : null,
        }));
      if (modeRows.length > 0) {
        const { error } = await supabase.from('mode_selection_events').upsert(modeRows, {
          onConflict: 'event_id',
          ignoreDuplicates: true,
        });
        if (!error) analyticsCounts.modeSelectionEvents = modeRows.length;
      }
    }

    const answerMetrics = Array.isArray(analytics.answerMetrics)
      ? analytics.answerMetrics.slice(0, MAX_ANALYTICS_ROWS)
      : [];
    if (answerMetrics.length > 0) {
      const metricRows = (answerMetrics as Array<Record<string, unknown>>)
        .filter(m => typeof m.attemptId === 'string' && typeof m.questionId === 'string')
        .map(m => ({
          client_id: clientId,
          attempt_id: m.attemptId as string,
          question_id: m.questionId as string,
          unit_code: typeof m.unitCode === 'string' ? m.unitCode : '',
          question_type: typeof m.questionType === 'string' ? m.questionType : '',
          difficulty: typeof m.difficulty === 'string' ? m.difficulty : '',
          block: typeof m.block === 'string' ? m.block : null,
          question_order: typeof m.questionOrder === 'number' ? Math.round(m.questionOrder) : 0,
          correct: m.correct === true,
          student_answer: typeof m.studentAnswer === 'string' ? m.studentAnswer.slice(0, 500) : '',
          correct_answer: typeof m.correctAnswer === 'string' ? m.correctAnswer.slice(0, 500) : '',
          response_ms: typeof m.responseMs === 'number' ? Math.max(0, Math.round(m.responseMs)) : 0,
          first_action_ms: typeof m.firstActionMs === 'number' ? Math.max(0, Math.round(m.firstActionMs)) : null,
          feedback_dwell_ms: typeof m.feedbackDwellMs === 'number' ? Math.max(0, Math.round(m.feedbackDwellMs)) : 0,
          answer_change_count: typeof m.answerChangeCount === 'number' ? Math.max(0, Math.round(m.answerChangeCount)) : 0,
          selection_count: typeof m.selectionCount === 'number' ? Math.max(0, Math.round(m.selectionCount)) : 0,
        }));
      if (metricRows.length > 0) {
        const { error } = await supabase.from('answer_metrics').upsert(metricRows, {
          onConflict: 'client_id,attempt_id,question_id',
          ignoreDuplicates: true,
        });
        if (!error) analyticsCounts.answerMetrics = metricRows.length;
      }
    }

    const quizEvents = Array.isArray(analytics.quizEvents)
      ? analytics.quizEvents.slice(0, MAX_ANALYTICS_ROWS)
      : [];
    if (quizEvents.length > 0) {
      const eventRows = (quizEvents as Array<Record<string, unknown>>)
        .filter(e => typeof e.eventId === 'string')
        .map(e => ({
          event_id: e.eventId as string,
          client_id: clientId,
          attempt_id: typeof e.attemptId === 'string' ? e.attemptId : '',
          question_id: typeof e.questionId === 'string' ? e.questionId : null,
          event_type: typeof e.eventType === 'string' ? e.eventType : '',
          event_at: typeof e.eventAt === 'string' && isIsoDate(e.eventAt) ? e.eventAt : new Date().toISOString(),
          elapsed_ms: typeof e.elapsedMs === 'number' ? Math.max(0, Math.round(e.elapsedMs)) : 0,
          payload: e.payload ?? {},
        }));
      if (eventRows.length > 0) {
        const { error } = await supabase.from('quiz_events').upsert(eventRows, {
          onConflict: 'event_id',
          ignoreDuplicates: true,
        });
        if (!error) analyticsCounts.quizEvents = eventRows.length;
      }
    }

    const recommendationEvents = Array.isArray(analytics.recommendationEvents)
      ? analytics.recommendationEvents.slice(0, MAX_ANALYTICS_ROWS)
      : [];
    if (recommendationEvents.length > 0) {
      const recRows = (recommendationEvents as Array<Record<string, unknown>>)
        .filter(e => typeof e.eventId === 'string')
        .map(e => ({
          event_id: e.eventId as string,
          client_id: clientId,
          recommendation_type: typeof e.recommendationType === 'string' ? e.recommendationType : '',
          href: typeof e.href === 'string' ? e.href.slice(0, 500) : '',
          shown_at: typeof e.shownAt === 'string' && isIsoDate(e.shownAt) ? e.shownAt : new Date().toISOString(),
          clicked: e.clicked === true,
          clicked_at: typeof e.clickedAt === 'string' && isIsoDate(e.clickedAt) ? e.clickedAt : null,
          led_to_mode: typeof e.ledToMode === 'string' ? e.ledToMode : null,
          urgent: e.urgent === true,
          dday: typeof e.dday === 'number' ? Math.round(e.dday) : null,
        }));
      if (recRows.length > 0) {
        const { error } = await supabase.from('recommendation_events').upsert(recRows, {
          onConflict: 'event_id',
          ignoreDuplicates: true,
        });
        if (!error) analyticsCounts.recommendationEvents = recRows.length;
      }
    }
  } catch {
    // Analytics failure is intentionally non-fatal.
  }

  return NextResponse.json({ ok: true, answers: rows.length, analytics: analyticsCounts });
}
