import { NextRequest, NextResponse } from 'next/server';
import { verifyTeacher } from '@/lib/teacherAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { fetchQuestionLookup } from '@/lib/sheets';

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
    .select('student_answer, correct')
    .eq('question_id', questionId);

  if (error) {
    return NextResponse.json({ error: 'query failed' }, { status: 500 });
  }

  // 정답 텍스트는 answers에 저장하지 않으므로 question_id로 앱 데이터에서 복원.
  const qLookup = await fetchQuestionLookup();
  const correctAnswerText = qLookup[questionId]?.answer ?? '';

  const wrongDist: Record<string, number> = {};
  let correctCount = 0;
  let totalCount = 0;

  for (const row of data ?? []) {
    totalCount++;
    if (row.correct) {
      correctCount++;
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
