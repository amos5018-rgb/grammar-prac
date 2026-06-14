import { NextResponse } from 'next/server';
import { TEACHER_COOKIE } from '@/lib/teacherAuth';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TEACHER_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return res;
}
