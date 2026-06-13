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
  last_synced_at: string;
}

export async function GET(request: NextRequest) {
  if (!verifyTeacher(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'supabase not configured' }, { status: 503 });
  }

  const [unitRes, qRes, rosterRes] = await Promise.all([
    supabase.from('v_unit_rates').select('*'),
    supabase.from('v_question_rates').select('*').limit(50),
    supabase
      .from('students')
      .select('client_id,name,student_id,streak,activity_dates,unit_tiers,last_synced_at')
      .order('last_synced_at', { ascending: false }),
  ]);

  if (unitRes.error || qRes.error || rosterRes.error) {
    return NextResponse.json({ error: 'query failed' }, { status: 500 });
  }

  const roster = (rosterRes.data ?? []) as RosterRow[];

  // 마스터 현황: 단원별 마스터 학생 수 + 학생당 마스터 단원 수
  const masteryByUnit: Record<string, number> = {};
  for (const s of roster) {
    for (const [code, tier] of Object.entries(s.unit_tiers ?? {})) {
      if (tier?.mastered) masteryByUnit[code] = (masteryByUnit[code] ?? 0) + 1;
    }
  }

  // 스트릭 분포
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const activeToday = roster.filter(s => (s.activity_dates ?? []).includes(todayStr)).length;

  return NextResponse.json({
    totalStudents: roster.length,
    activeToday,
    unitRates: unitRes.data ?? [],
    questionRates: qRes.data ?? [],
    masteryByUnit,
    roster: roster.map(s => ({
      clientId: s.client_id,
      name: s.name,
      studentId: s.student_id,
      streak: s.streak,
      masteredCount: Object.values(s.unit_tiers ?? {}).filter(t => t?.mastered).length,
      lastSyncedAt: s.last_synced_at,
    })),
  });
}
