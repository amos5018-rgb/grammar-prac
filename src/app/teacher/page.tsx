'use client';

import { useEffect, useState } from 'react';
import TeacherLogin from '@/components/teacher/TeacherLogin';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';

export default function TeacherPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/teacher/me')
      .then(r => r.json())
      .then(d => setAuthed(!!d.authed))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-text-secondary">
        불러오는 중...
      </div>
    );
  }

  if (!authed) {
    return <TeacherLogin onSuccess={() => setAuthed(true)} />;
  }

  return <TeacherDashboard onLogout={() => setAuthed(false)} />;
}
