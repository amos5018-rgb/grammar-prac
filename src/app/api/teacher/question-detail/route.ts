import { NextRequest, NextResponse } from 'next/server';
import { verifyTeacher } from '@/lib/teacherAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!verifyTeacher(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const questionId = request.nextUrl.searchParams.get('questionId');
  if (!questionId) {
    return NextResponse.json({ error: 'questionId required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('answers')
    .select('student_answer, correct_answer, correct')
    .eq('question_id', questionId);

  if (error) {
    return NextResponse.json({ error: 'query failed' }, { status: 500 });
  }

  const wrongDist: Record<string, number> = {};
  let correctCount = 0;
  let totalCount = 0;
  let correctAnswerText = '';

  for (const row of data ?? []) {
    totalCount++;
    if (row.correct) {
      correctCount++;
      if (!correctAnswerText && row.correct_answer) correctAnswerText = row.correct_answer;
    } else if (row.student_answer) {
      wrongDist[row.student_answer] = (wrongDist[row.student_answer] ?? 0) + 1;
    }
  }

  const topWrong = Object.entries(wrongDist)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([answer, count]) => ({ answer, count }));

  return NextResponse.json({
    questionId,
    totalCount,
    correctCount,
    correctAnswer: correctAnswerText,
    topWrongAnswers: topWrong,
  });
}
