import type { MetadataRoute } from 'next';

// 웹 매니페스트 — '홈 화면에 추가' 시 기본 앱 이름을 결정
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '국어 문법 연습',
    short_name: '국어 문법 연습',
    description: '고등학교 국어 문법 인출·적용 연습 웹앱',
    start_url: '/',
    display: 'standalone',
    background_color: '#3b82f6',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
