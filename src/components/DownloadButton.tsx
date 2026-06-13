'use client';

export default function DownloadButton({ fileName, label, color }: {
  fileName: string;
  label: string;
  color: 'primary' | 'warning';
}) {
  const colorClass = color === 'primary'
    ? 'bg-primary-light text-primary'
    : 'bg-warning-light text-warning';

  const handleClick = () => {
    window.location.assign(`/api/download?file=${encodeURIComponent(fileName)}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 ${colorClass} px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-80 transition-opacity`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
    </button>
  );
}
