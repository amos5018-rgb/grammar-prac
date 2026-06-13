import fs from 'fs';
import path from 'path';

export const revalidate = 300;

interface WorksheetGroup {
  title: string;
  studentFile?: string;
  teacherFile?: string;
}

function getMaterials() {
  const dir = path.join(process.cwd(), 'public', 'materials');
  if (!fs.existsSync(dir)) return { worksheets: [], supplements: [] };

  const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));

  const worksheetMap = new Map<string, WorksheetGroup>();
  const supplements: string[] = [];

  for (const file of files) {
    const studentMatch = file.match(/^(.+)\(학생용\)\..+$/);
    const teacherMatch = file.match(/^(.+)\(교사용\)\..+$/);

    if (studentMatch) {
      const title = studentMatch[1].trim();
      const group = worksheetMap.get(title) ?? { title };
      group.studentFile = file;
      worksheetMap.set(title, group);
    } else if (teacherMatch) {
      const title = teacherMatch[1].trim();
      const group = worksheetMap.get(title) ?? { title };
      group.teacherFile = file;
      worksheetMap.set(title, group);
    } else {
      supplements.push(file);
    }
  }

  return {
    worksheets: [...worksheetMap.values()],
    supplements,
  };
}

export default function MaterialsPage() {
  const { worksheets, supplements } = getMaterials();
  const isEmpty = worksheets.length === 0 && supplements.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">학습 자료</h1>
      <p className="text-text-secondary text-sm mb-6">수업에서 사용한 학습지와 참고 자료를 확인하세요</p>

      {isEmpty ? (
        <div className="text-center py-16">
          <p className="text-text-secondary">아직 등록된 학습 자료가 없습니다.</p>
        </div>
      ) : (
        <>
          {worksheets.length > 0 && (
            <>
              <h2 className="text-lg font-bold mb-4">학습지</h2>
              <div className="space-y-3 mb-8">
                {worksheets.map(ws => (
                  <div key={ws.title} className="bg-surface rounded-2xl border border-border p-5">
                    <h3 className="font-bold text-lg mb-3">{ws.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ws.studentFile && (
                        <FileLink
                          href={`/materials/${encodeURIComponent(ws.studentFile)}`}
                          label="학생용 열기"
                          color="primary"
                        />
                      )}
                      {ws.teacherFile && (
                        <FileLink
                          href={`/materials/${encodeURIComponent(ws.teacherFile)}`}
                          label="교사용 열기"
                          color="warning"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {ws.studentFile && (
                        <DownloadLink
                          href={`/materials/${encodeURIComponent(ws.studentFile)}`}
                          label="학생용 다운로드"
                        />
                      )}
                      {ws.teacherFile && (
                        <DownloadLink
                          href={`/materials/${encodeURIComponent(ws.teacherFile)}`}
                          label="교사용 다운로드"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {supplements.length > 0 && (
            <>
              <h2 className="text-lg font-bold mb-4">추가 자료</h2>
              <div className="space-y-3">
                {supplements.map(file => {
                  const title = file.replace(/\.[^.]+$/, '');
                  const encoded = encodeURIComponent(file);
                  return (
                    <div key={file} className="bg-surface rounded-2xl border border-border p-5">
                      <h3 className="font-bold mb-3">{title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileLink href={`/materials/${encoded}`} label="열기" color="primary" />
                        <DownloadLink href={`/materials/${encoded}`} label="다운로드" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function FileLink({ href, label, color }: { href: string; label: string; color: 'primary' | 'warning' }) {
  const colorClass = color === 'primary'
    ? 'bg-primary-light text-primary'
    : 'bg-warning-light text-warning';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 ${colorClass} px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-80 transition-opacity`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      {label}
    </a>
  );
}

function DownloadLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-1.5 text-text-secondary hover:text-primary px-3 py-1.5 rounded-full text-sm font-medium border border-border hover:border-primary/40 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
    </a>
  );
}
