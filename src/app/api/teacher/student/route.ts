import { NextRequest, NextResponse } from 'next/server';
import { verifyTeacher } from '@/lib/teacherAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!verifyTeacher(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const clientId = request.nextUrl.searchParams.get('clientId');
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'supabase not configured' }, { status: 503 });
  }

  const [studentRes, answersRes] = await Promise.all([
    supabase
      .from('students')
      .select('client_id,name,student_id,streak,activity_dates,unit_tiers,unit_progress,last_synced_at')
      .eq('client_id', clientId)
      .single(),
    supabase
      .from('answers')
      .select('attempt_id,question_id,unit_code,correct,answered_at')
      .eq('client_id', clientId)
      .order('answered_at', { ascending: false }),
  ]);

  if (studentRes.error || !studentRes.data) {
    return NextResponse.json({ error: 'student not found' }, { status: 404 });
  }

  const student = studentRes.data;
  const answers = answersRes.data ?? [];

  // Unit correct rates
  const unitStats: Record<string, { correct: number; total: number }> = {};
  for (const a of answers) {
    let entry = unitStats[a.unit_code];
    if (!entry) {
      entry = { correct: 0, total: 0 };
      unitStats[a.unit_code] = entry;
    }
    entry.total++;
    if (a.correct) entry.correct++;
  }
  const unitCorrectRates: Record<string, { correct: number; total: number; rate: number }> = {};
  for (const [code, s] of Object.entries(unitStats)) {
    unitCorrectRates[code] = {
      correct: s.correct,
      total: s.total,
      rate: s.total > 0 ? Math.round((s.correct / s.total) * 1000) / 10 : 0,
    };
  }

  // Recent attempts (group by attempt_id, take latest 10)
  const attemptMap = new Map<string, { attemptId: string; unitCode: string; date: string; correct: number; total: number }>();
  for (const a of answers) {
    let entry = attemptMap.get(a.attempt_id);
    if (!entry) {
      entry = { attemptId: a.attempt_id, unitCode: a.unit_code, date: a.answered_at, correct: 0, total: 0 };
      attemptMap.set(a.attempt_id, entry);
    }
    entry.total++;
    if (a.correct) entry.correct++;
  }
  const recentAttempts = [...attemptMap.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  return NextResponse.json({
    profile: {
      name: student.name,
      studentId: student.student_id,
      streak: student.streak,
      activityDates: student.activity_dates ?? [],
      unitTiers: student.unit_tiers ?? {},
      unitProgress: student.unit_progress ?? {},
    },
    recentAttempts,
    unitCorrectRates,
  });
}
