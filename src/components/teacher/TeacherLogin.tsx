'use client';

import { useState } from 'react';

export default function TeacherLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        setError('비밀번호가 일치하지 않습니다.');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-surface rounded-2xl border border-border p-6 space-y-4"
      >
        <h1 className="text-xl font-bold text-text text-center">교사 대시보드</h1>
        <p className="text-sm text-text-secondary text-center">
          접근하려면 비밀번호를 입력하세요.
        </p>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="비밀번호"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
        {error && <p className="text-sm text-error text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || !pw}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 transition-colors hover:bg-primary-dark"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
