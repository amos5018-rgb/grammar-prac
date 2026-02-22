'use client';

import { useState } from 'react';
import { saveProfile } from '@/lib/storage';

export default function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim()) return;
    saveProfile({ name: name.trim(), studentId: studentId.trim() });
    onLogin();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold text-center mb-2">국어 문법 연습</h2>
        <p className="text-text-secondary text-center text-sm mb-8">이름과 학번을 입력하고 시작하세요</p>
        <label className="block mb-4">
          <span className="text-sm font-medium text-text mb-1 block">이름</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="홍길동"
            className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base"
            required
          />
        </label>
        <label className="block mb-6">
          <span className="text-sm font-medium text-text mb-1 block">학번</span>
          <input
            type="text"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            placeholder="10101"
            className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors"
        >
          시작하기
        </button>
      </form>
    </div>
  );
}
