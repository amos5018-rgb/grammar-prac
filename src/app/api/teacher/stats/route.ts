import { NextRequest, NextResponse } from 'next/server';
import { verifyTeacher } from '@/lib/teacherAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

interface RosterRow {
  client_id: string;
  name: string;
  student_id: string;
  streak: number;
  activity_dates: string[];
  unit_tiers: Record<string, { level: string; label: string; mastered: boolean; bestScore: number | null }>;
  unit_progress: Record<string, { attempts: number; bestScore: number | null }>;
  last_synced_at: string;
  created_at: string;
}

interface DailyRow {
  d: string;
  active_students: number;
  total_answers: number;
  correct_answers: number;
}

interface PerStudentRow {
  client_id: string;
  total: number;
  correct: number;
}

function todayStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export async function GET(request: NextRequest) {
  if (!verifyTeacher(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'supabase not configured' }, { status: 503 });
  }

  const today = todayStr();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [
    unitRes,
    qRes,
    rosterRes,
    dailyRes,
    perStudentRes,
    modeByStudentRes,
    modeByUnitRes,
    opportunityRes,
    reviewTriggersRes,
    randomVsFullRes,
    recommendationRes,
    transitionsRes,
    questionDiagnosticsRes,
  ] = await Promise.all([
    supabase.from('v_unit_rates').select('*'),
    supabase.from('v_question_rates').select('*').limit(100),
    supabase
      .from('students')
      .select('client_id,name,student_id,streak,activity_dates,unit_tiers,unit_progress,last_synced_at,created_at')
      .order('last_synced_at', { ascending: false }),
    supabase.rpc('get_daily_trend', { since_date: thirtyDaysAgo }).select('*'),
    supabase.rpc('get_per_student_rates').select('*'),
    supabase.from('v_mode_preference_by_student').select('*').limit(200),
    supabase.from('v_mode_preference_by_unit').select('*').limit(200),
    supabase.from('v_mode_opportunity_rates').select('*').limit(200),
    supabase.from('v_review_trigger_patterns').select('*').limit(100),
    supabase.from('v_random_vs_full_outcomes').select('*').limit(20),
    supabase.from('v_recommendation_effectiveness').select('*').limit(100),
    supabase.from('v_session_transition_patterns').select('*').limit(100),
    supabase.from('v_question_diagnostics').select('*').limit(100),
  ]);

  if (unitRes.error || qRes.error || rosterRes.error) {
    return NextResponse.json({ error: 'query failed' }, { status: 500 });
  }

  const roster = (rosterRes.data ?? []) as RosterRow[];

  // Daily trend — fallback if RPC not available
  let dailyTrend: Array<{ date: string; activeStudents: number; totalAnswers: number; correctAnswers: number; correctRate: number }> = [];
  if (!dailyRes.error && dailyRes.data) {
    dailyTrend = (dailyRes.data as DailyRow[]).map(r => ({
      date: r.d,
      activeStudents: r.active_students,
      totalAnswers: r.total_answers,
      correctAnswers: r.correct_answers,
      correctRate: r.total_answers > 0 ? Math.round((r.correct_answers / r.total_answers) * 1000) / 10 : 0,
    }));
  } else {
    // Fallback: compute from activity_dates
    const dateMap: Record<string, number> = {};
    for (const s of roster) {
      for (const d of s.activity_dates ?? []) {
        if (d >= thirtyDaysAgo) dateMap[d] = (dateMap[d] ?? 0) + 1;
      }
    }
    dailyTrend = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, activeStudents]) => ({
        date,
        activeStudents,
        totalAnswers: 0,
        correctAnswers: 0,
        correctRate: 0,
      }));
  }

  // Per-student correct rates
  const perStudentMap: Record<string, { total: number; correct: number }> = {};
  if (!perStudentRes.error && perStudentRes.data) {
    for (const r of perStudentRes.data as PerStudentRow[]) {
      perStudentMap[r.client_id] = { total: r.total, correct: r.correct };
    }
  }

  // Overall correct rate
  let overallCorrect = 0;
  let overallTotal = 0;
  for (const row of unitRes.data ?? []) {
    overallTotal += row.total_answers;
    overallCorrect += row.correct_answers;
  }
  const overallCorrectRate = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 1000) / 10 : 0;

  // Active today
  const activeToday = roster.filter(s => (s.activity_dates ?? []).includes(today)).length;

  // Average mastered count
  let totalMastered = 0;
  for (const s of roster) {
    for (const t of Object.values(s.unit_tiers ?? {})) {
      if (t?.mastered) totalMastered++;
    }
  }
  const avgMasteredCount = roster.length > 0 ? Math.round((totalMastered / roster.length) * 10) / 10 : 0;

  // Mastery by unit (for UnitRatesTable)
  const masteryByUnit: Record<string, number> = {};
  for (const s of roster) {
    for (const [code, tier] of Object.entries(s.unit_tiers ?? {})) {
      if (tier?.mastered) masteryByUnit[code] = (masteryByUnit[code] ?? 0) + 1;
    }
  }

  // Risk tags
  const riskRoster = roster.map(s => {
    const riskTags: string[] = [];
    const masteredCount = Object.values(s.unit_tiers ?? {}).filter(t => t?.mastered).length;
    const studentStats = perStudentMap[s.client_id];
    const correctRate = studentStats && studentStats.total > 0
      ? Math.round((studentStats.correct / studentStats.total) * 1000) / 10
      : null;

    // Inactive: no activity in last 3 days
    const sortedDates = [...(s.activity_dates ?? [])].sort();
    const lastActivity = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;
    const inactiveDays = lastActivity ? daysBetween(lastActivity, today) : 999;
    if (inactiveDays >= 3) riskTags.push('inactive');

    // Low mastery: < 3 mastered && registered 7+ days
    const registeredDays = s.created_at ? daysBetween(s.created_at.slice(0, 10), today) : 0;
    if (masteredCount < 3 && registeredDays >= 7) riskTags.push('low-mastery');

    // Struggling: < 50% correct with 20+ answers
    if (correctRate !== null && correctRate < 50 && (studentStats?.total ?? 0) >= 20) {
      riskTags.push('struggling');
    }

    return {
      clientId: s.client_id,
      name: s.name,
      studentId: s.student_id,
      streak: s.streak,
      masteredCount,
      lastSyncedAt: s.last_synced_at,
      correctRate,
      totalAnswers: studentStats?.total ?? 0,
      riskTags,
      unitTiers: s.unit_tiers ?? {},
      unitProgress: s.unit_progress ?? {},
      inactiveDays: inactiveDays < 999 ? inactiveDays : null,
    };
  });

  return NextResponse.json({
    totalStudents: roster.length,
    activeToday,
    overallCorrectRate,
    avgMasteredCount,
    dailyTrend,
    unitRates: unitRes.data ?? [],
    questionRates: qRes.data ?? [],
    masteryByUnit,
    roster: riskRoster,
    patterns: {
      modeByStudent: modeByStudentRes.error ? [] : modeByStudentRes.data ?? [],
      modeByUnit: modeByUnitRes.error ? [] : modeByUnitRes.data ?? [],
      opportunityRates: opportunityRes.error ? [] : opportunityRes.data ?? [],
      reviewTriggers: reviewTriggersRes.error ? [] : reviewTriggersRes.data ?? [],
      randomVsFullOutcomes: randomVsFullRes.error ? [] : randomVsFullRes.data ?? [],
      recommendationEffectiveness: recommendationRes.error ? [] : recommendationRes.data ?? [],
      sessionTransitions: transitionsRes.error ? [] : transitionsRes.data ?? [],
      questionDiagnostics: questionDiagnosticsRes.error ? [] : questionDiagnosticsRes.data ?? [],
    },
  });
}
