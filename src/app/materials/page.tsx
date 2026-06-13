import { worksheets, supplements } from '@/data/materials';

export const revalidate = 300;

export default function MaterialsPage() {
  const sortedWorksheets = [...worksheets].sort((a, b) => a.order - b.order);
  const sortedSupplements = [...supplements].sort((a, b) => a.order - b.order);
  const isEmpty = sortedWorksheets.length === 0 && sortedSupplements.length === 0;

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
          {/* 학습지 */}
          {sortedWorksheets.length > 0 && (
            <>
              <h2 className="text-lg font-bold mb-1">학습지</h2>
              <p className="text-text-secondary text-sm mb-4">학생용과 교사용 학습지를 내려받을 수 있어요</p>
              <div className="space-y-3 mb-8">
                {sortedWorksheets.map((ws, idx) => (
                  <div key={idx} className="bg-surface rounded-2xl border border-border p-5">
                    <h3 className="font-bold text-lg mb-3">{ws.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ws.studentFile && (
                        <FileLink
                          href={`/materials/${ws.studentFile}`}
                          label="학생용"
                          color="primary"
                        />
                      )}
                      {ws.teacherFile && (
                        <FileLink
                          href={`/materials/${ws.teacherFile}`}
                          label="교사용"
                          color="warning"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 추가 자료 */}
          {sortedSupplements.length > 0 && (
            <>
              <h2 className="text-lg font-bold mb-1">추가 자료</h2>
              <p className="text-text-secondary text-sm mb-4">학습에 도움이 되는 참고 자료예요</p>
              <div className="space-y-3">
                {sortedSupplements.map((sup, idx) => (
                  <a
                    key={idx}
                    href={`/materials/${sup.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-surface rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.99]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{sup.title}</p>
                      {sup.description && (
                        <p className="text-sm text-text-secondary mt-0.5">{sup.description}</p>
                      )}
                    </div>
                    <DownloadIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
                  </a>
                ))}
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
      <DownloadIcon className="w-4 h-4" />
      {label}
    </a>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
