// ============================================================
// 📄 학습 자료 목록 (선생님이 편집하는 파일)
// ============================================================
// '학습 자료' 메뉴에 표시되는 학습지와 추가 자료 목록입니다.
//
// ▶ 파일 올리는 방법
//   1. PDF 등 파일을 깃허브 저장소의 public/materials/ 폴더에 올립니다.
//   2. 아래 목록에 그 파일 정보를 한 줄 추가합니다.
//      (파일명은 public/materials/ 안의 이름과 똑같이 적어야 합니다)
//
// ──────────────────────────────────────────────
// [학습지] worksheets — 학생용/교사용 통합 학습지
//   title:       화면에 표시될 이름 (예: '문법 학습지')
//   studentFile: 학생용 파일명 (없으면 줄 자체를 생략)
//   teacherFile: 교사용 파일명 (없으면 줄 자체를 생략)
//   order:       표시 순서 (숫자가 작을수록 먼저 나옴)
//
// [추가 자료] supplements — 학습지 외 참고 자료
//   title:       자료 제목
//   fileName:    파일명
//   description: 간단한 설명 (선택, 없으면 줄 생략)
//   order:       표시 순서
//
// ⚠️ 목록에 적은 파일명과 public/materials/ 안의 파일명이
//    다르면 화면에서 열리지 않습니다. 철자를 꼭 확인하세요.
// ============================================================
import { Worksheet, Supplement } from '@/lib/types';

export const worksheets: Worksheet[] = [
  // 예시) 아래 형식으로 추가하세요. 파일은 public/materials/ 에 올립니다.
  // {
  //   title: '문법 학습지',
  //   studentFile: 'grammar-worksheet-student.pdf',
  //   teacherFile: 'grammar-worksheet-teacher.pdf',
  //   order: 1,
  // },
];

export const supplements: Supplement[] = [
  // 예시) 아래 형식으로 추가하세요.
  // {
  //   title: '음운 변동 정리표',
  //   fileName: 'phoneme-change-summary.pdf',
  //   description: '한눈에 보는 음운 변동 정리',
  //   order: 1,
  // },
];
