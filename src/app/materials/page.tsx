import fs from 'fs';
import path from 'path';
import DownloadButton from '@/components/DownloadButton';

// 학습 자료는 public/materials 파일시스템만 읽음(외부 데이터 없음) → 재배포 시에만 변경.
// 완전 정적으로 처리해 ISR 재생성을 제거한다.
export const revalidate = false;

interface WorksheetGroup {
  title: string;
  studentFile?: string;
  teacherFile?: string;
  pptFile?: string;
}

function getMaterials() {
  const dir = path.join(process.cwd(), 'public', 'materials');
  if (!fs.existsSync(dir)) return { worksheets: [], supplements: [] };

  const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));

  const worksheetMap = new Map<string, WorksheetGroup>();
  const supplements: string[] = [];
  let grammarElementsPptFile: string | undefined;

  for (const file of files) {
    const studentMatch = file.match(/^(.+)\(학생용\)\..+$/);
    const teacherMatch = file.match(/^(.+)\(교사용\)\..+$/);
    const grammarElementsPptMatch = file.match(/^문법요소 ppt\(배포용\)\..+$/i);

    if (grammarElementsPptMatch) {
      grammarElementsPptFile = file;
    } else if (studentMatch) {
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

  if (grammarElementsPptFile) {
    const title = '음운의 변동+문법 요소';
    const group = worksheetMap.get(title) ?? { title };
    group.pptFile = grammarElementsPptFile;
    worksheetMap.set(title, group);
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
                        <DownloadButton fileName={ws.studentFile} label="학생용" color="primary" />
                      )}
                      {ws.teacherFile && (
                        <DownloadButton fileName={ws.teacherFile} label="교사용" color="warning" />
                      )}
                      {ws.pptFile && (
                        <DownloadButton fileName={ws.pptFile} label="PPT" color="success" />
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
                  return (
                    <div key={file} className="bg-surface rounded-2xl border border-border p-5">
                      <h3 className="font-bold mb-3">{title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <DownloadButton fileName={file} label="다운로드" color="primary" />
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
