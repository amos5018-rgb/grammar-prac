import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get('file');
  if (!fileName) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const safeName = path.basename(fileName);
  const filePath = path.join(process.cwd(), 'public', 'materials', safeName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(safeName).toLowerCase();
  const mime = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';

  // RFC 5987 ext-value 인코딩: attr-char 외 모든 문자를 퍼센트 인코딩
  // (encodeURIComponent가 남기는 ()!*'까지 추가로 인코딩)
  const rfc5987 = encodeURIComponent(safeName).replace(
    /[!'()*]/g,
    c => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
  );
  // ASCII fallback(filename): filename*를 못 읽는 구형 클라이언트용
  const asciiFallback = safeName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '');
  const disposition = `attachment; filename="${asciiFallback}"; filename*=UTF-8''${rfc5987}`;

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': mime,
      'Content-Disposition': disposition,
      'Content-Length': String(fileBuffer.length),
      'Cache-Control': 'no-store',
    },
  });
}
