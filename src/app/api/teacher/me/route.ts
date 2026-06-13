import { NextRequest, NextResponse } from 'next/server';
import { verifyTeacher } from '@/lib/teacherAuth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return NextResponse.json({ authed: verifyTeacher(request) });
}
