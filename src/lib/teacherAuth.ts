import 'server-only';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const TEACHER_COOKIE = 'teacher_session';
const SESSION_HOURS = 12;

function getSecret(): string {
  return process.env.TEACHER_SESSION_SECRET || process.env.TEACHER_PASSWORD || '';
}

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

// 비밀번호 상수시간 비교
export function checkPassword(input: string): boolean {
  const expected = process.env.TEACHER_PASSWORD || '';
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// payload(만료시각) + HMAC 서명 → 쿠키 값
export function signSession(): string {
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = b64url(Buffer.from(JSON.stringify({ exp })));
  const sig = b64url(crypto.createHmac('sha256', getSecret()).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = b64url(crypto.createHmac('sha256', getSecret()).update(payload).digest());
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export function verifyTeacher(request: NextRequest): boolean {
  return verifySession(request.cookies.get(TEACHER_COOKIE)?.value);
}
