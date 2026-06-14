import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.hwp': 'application/x-hwp',
  '.txt': 'text/plain; charset=utf-8',
};

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get('file');
  if (!fileName) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const safeName = path.basename(fileName);
  const filePath = path.join(process.cwd(), 'public', 'materials', safeName);

  let fileBuffer: Buffer;
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }
    fileBuffer = fs.readFileSync(filePath);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const ext = path.extname(safeName).toLowerCase();
  const mime = MIME_MAP[ext] ?? 'application/octet-stream';

  const rfc5987 = encodeURIComponent(safeName).replace(
    /[!'()*]/g,
    c => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
  );
  const asciiFallback = safeName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '');
  const disposition = `attachment; filename="${asciiFallback}"; filename*=UTF-8''${rfc5987}`;

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      'Content-Type': mime,
      'Content-Disposition': disposition,
      'Content-Length': String(fileBuffer.length),
      'Cache-Control': 'no-store',
    },
  });
}
