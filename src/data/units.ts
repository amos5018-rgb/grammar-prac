// ============================================================
// 📚 단원 목록 (선생님이 편집하는 파일)
// ============================================================
// 새 단원을 추가하려면 아래 형식대로 한 줄을 추가하세요.
//
//   code:        영문 식별자 (다른 단원과 겹치면 안 됨, 띄어쓰기 없이)
//   name:        화면에 표시될 단원 이름
//   description: 단원 설명 (카드에 표시됨)
//   order:       표시 순서 (숫자가 작을수록 먼저 나옴)
//   active:      false로 바꾸면 화면에서 숨겨짐 (문제는 남아 있음)
//
// ⚠️ 단원을 추가하면 src/data/questions/ 폴더에
//    같은 code 이름의 문제 파일도 만들어야 합니다.
//    (자세한 방법은 TEACHER_GUIDE.md 참고)
// ============================================================
import { Unit } from '@/lib/types';

export const units: Unit[] = [
  {
    code: 'phoneme-basics',
    name: '음운의 개념과 환경',
    description: '음운의 정의, 말소리의 구조(초성·중성·종성), 음운의 환경, 음운의 분류 체계를 학습합니다.',
    order: 1,
    active: true,
  },
  {
    code: 'consonant-system',
    name: '자음 체계',
    description: '자음 체계표(발음 위치, 발음 방법, 소리의 세기)를 이해하고 적용하는 연습을 합니다.',
    order: 2,
    active: true,
  },
  {
    code: 'final-consonants',
    name: '받침의 발음',
    description: '음절의 끝소리 규칙과 받침 뒤 모음이 올 때의 발음 변화(실질적/문법적 의미)를 학습합니다.',
    order: 3,
    active: true,
  },
  {
    code: 'morpheme-basics',
    name: '형태소·조사·어미',
    description: '형태소의 개념과 분류, 체언과 조사, 용언과 어간·어미를 학습합니다.',
    order: 4,
    active: true,
  },
];
