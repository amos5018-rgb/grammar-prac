import { Unit, Question, QuestionType, Difficulty } from './types';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some(f => f !== '')) rows.push(currentRow);
        currentRow = [];
      } else if (char !== '\r') {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f !== '')) rows.push(currentRow);
  }

  return rows;
}

async function fetchSheet(sheetName: string): Promise<string[][]> {
  if (!SHEET_ID) return [];

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const text = await res.text();
    return parseCSV(text);
  } catch {
    return [];
  }
}

export async function fetchUnits(): Promise<Unit[]> {
  const rows = await fetchSheet('단원목록');
  if (rows.length <= 1) return getSampleUnits();

  return rows
    .slice(1)
    .map(row => ({
      code: row[0] || '',
      name: row[1] || '',
      description: row[2] || '',
      order: parseInt(row[3]) || 0,
      active: row[4]?.toUpperCase() === 'TRUE',
    }))
    .filter(u => u.active && u.code)
    .sort((a, b) => a.order - b.order);
}

export async function fetchQuestions(unitCode?: string): Promise<Question[]> {
  const rows = await fetchSheet('문제');
  if (rows.length <= 1) return getSampleQuestions(unitCode);

  const questions = rows.slice(1).map(row => ({
    id: row[0] || '',
    unitCode: row[1] || '',
    type: (row[2] || '객관식') as QuestionType,
    difficulty: (row[3] || '중') as Difficulty,
    passage: row[4] || '',
    question: row[5] || '',
    choices: [row[6], row[7], row[8], row[9]].filter(c => c && c.trim() !== ''),
    answer: row[10] || '',
    explanation: row[11] || '',
  }));

  if (unitCode) return questions.filter(q => q.unitCode === unitCode);
  return questions;
}

// ── 샘플 데이터 (Google Sheets 미연동 시 사용) ──

function getSampleUnits(): Unit[] {
  return [
    { code: 'phonology', name: '음운과 음운 변동', description: '음운의 개념과 교체, 탈락, 첨가, 축약 등 음운 변동의 종류를 학습합니다.', order: 1, active: true },
    { code: 'morpheme', name: '형태소와 단어', description: '형태소의 분류(자립/의존, 실질/형식)와 단어 형성법을 학습합니다.', order: 2, active: true },
    { code: 'pos', name: '품사', description: '국어 9품사의 분류 기준과 각 품사의 특성을 학습합니다.', order: 3, active: true },
    { code: 'sentence', name: '문장 성분', description: '주어, 서술어, 목적어, 보어, 관형어, 부사어, 독립어의 개념과 구분을 학습합니다.', order: 4, active: true },
  ];
}

function getSampleQuestions(unitCode?: string): Question[] {
  const all: Question[] = [
    // ── 음운과 음운 변동 ──
    {
      id: 'PH001', unitCode: 'phonology', type: '객관식', difficulty: '중',
      passage: '', question: '다음 중 비음화가 일어나는 단어는?',
      choices: ['국물', '신라', '칼날', '좋다'],
      answer: '1', explanation: "'국물'[궁물]: 'ㄱ' 뒤에 비음 'ㅁ'이 오면서 'ㄱ→ㅇ'으로 비음화가 일어납니다.",
    },
    {
      id: 'PH002', unitCode: 'phonology', type: 'ox', difficulty: '하',
      passage: '', question: "'신라[실라]'에서 일어나는 음운 변동은 비음화이다.",
      choices: [], answer: 'X', explanation: "유음화입니다. 'ㄴ'이 'ㄹ' 앞에서 'ㄹ'로 바뀌는 현상입니다. (ㄴ→ㄹ)",
    },
    {
      id: 'PH003', unitCode: 'phonology', type: '객관식', difficulty: '중',
      passage: '', question: `'놓다[노타]'에서 일어나는 음운 변동은?`,
      choices: ['비음화', '유음화', '거센소리되기(축약)', '된소리되기(경음화)'],
      answer: '3', explanation: "'ㅎ'과 'ㄷ'이 만나 거센소리 'ㅌ'으로 축약됩니다.",
    },
    {
      id: 'PH004', unitCode: 'phonology', type: '단답형', difficulty: '상',
      passage: '', question: "'한라산[할라산]'에서 일어나는 음운 변동의 이름은?",
      choices: [], answer: '유음화', explanation: "'ㄴ'이 'ㄹ'의 영향으로 'ㄹ'로 바뀌는 유음화입니다.",
    },
    {
      id: 'PH005', unitCode: 'phonology', type: '빈칸', difficulty: '중',
      passage: '', question: "음운 변동 중 교체에는 비음화, 유음화, [___], [___] 등이 있다.",
      choices: [], answer: '구개음화/된소리되기', explanation: "교체(바뀜): 비음화, 유음화, 구개음화, 된소리되기 등이 해당합니다.",
    },

    // ── 형태소와 단어 ──
    {
      id: 'MO001', unitCode: 'morpheme', type: '빈칸', difficulty: '중',
      passage: '', question: "'먹었다'를 형태소로 분석하면 [___] + [___] + [___]이다.",
      choices: [], answer: '먹/었/다', explanation: "먹(실질 형태소, 어근) + 었(형식 형태소, 선어말 어미) + 다(형식 형태소, 어말 어미)",
    },
    {
      id: 'MO002', unitCode: 'morpheme', type: '객관식', difficulty: '하',
      passage: '', question: "다음 중 자립 형태소는?",
      choices: ['~을', '~는', '하늘', '~었~'],
      answer: '3', explanation: "'하늘'은 홀로 쓸 수 있는 자립 형태소입니다. 나머지는 다른 말에 붙어야 하는 의존 형태소입니다.",
    },
    {
      id: 'MO003', unitCode: 'morpheme', type: 'ox', difficulty: '중',
      passage: '', question: "'풋사과'에서 '풋-'은 접두사이다.",
      choices: [], answer: 'O', explanation: "'풋-'은 '덜 익은'이라는 뜻을 더하는 접두사입니다. '풋사과'는 파생어입니다.",
    },
    {
      id: 'MO004', unitCode: 'morpheme', type: '단답형', difficulty: '상',
      passage: '', question: "어근과 어근이 결합하여 만들어진 단어를 무엇이라 하는가?",
      choices: [], answer: '합성어', explanation: "합성어는 어근 + 어근으로 이루어진 단어입니다. (예: 논밭, 돌다리)",
    },

    // ── 품사 ──
    {
      id: 'PS001', unitCode: 'pos', type: '객관식', difficulty: '하',
      passage: '', question: "국어의 9품사에 해당하지 않는 것은?",
      choices: ['명사', '대명사', '접속사', '감탄사'],
      answer: '3', explanation: "국어에는 '접속사'가 없습니다. 9품사: 명사, 대명사, 수사, 동사, 형용사, 관형사, 부사, 조사, 감탄사",
    },
    {
      id: 'PS002', unitCode: 'pos', type: 'ox', difficulty: '중',
      passage: '', question: "'매우'는 관형사이다.",
      choices: [], answer: 'X', explanation: "'매우'는 부사입니다. 용언(동사/형용사)이나 다른 부사를 수식합니다. 관형사는 체언(명사 등)을 수식합니다.",
    },
    {
      id: 'PS003', unitCode: 'pos', type: '객관식', difficulty: '중',
      passage: '', question: "다음 중 활용(어형 변화)을 하는 품사끼리 묶인 것은?",
      choices: ['명사, 동사', '동사, 형용사', '형용사, 부사', '관형사, 동사'],
      answer: '2', explanation: "활용을 하는 품사는 동사와 형용사(=용언)입니다. 나머지 품사는 형태가 변하지 않는 불변어입니다.",
    },
    {
      id: 'PS004', unitCode: 'pos', type: '단답형', difficulty: '중',
      passage: '', question: "체언 뒤에 붙어 문법적 관계를 나타내는 품사는?",
      choices: [], answer: '조사', explanation: "조사는 체언(명사, 대명사, 수사) 뒤에 붙어 문법적 관계를 표시합니다. (예: 이/가, 을/를, 은/는)",
    },

    // ── 문장 성분 ──
    {
      id: 'ST001', unitCode: 'sentence', type: '객관식', difficulty: '중',
      passage: '', question: "'철수가 학교에서 열심히 공부를 했다.'에서 부사어는?",
      choices: ['철수가', '학교에서, 열심히', '공부를', '했다'],
      answer: '2', explanation: "'학교에서'(부사격 조사 '에서'가 결합)와 '열심히'(부사)가 서술어 '했다'를 수식하는 부사어입니다.",
    },
    {
      id: 'ST002', unitCode: 'sentence', type: 'ox', difficulty: '하',
      passage: '', question: "주성분에는 주어, 서술어, 목적어, 보어가 포함된다.",
      choices: [], answer: 'O', explanation: "주성분(문장의 골격): 주어, 서술어, 목적어, 보어. 부속 성분: 관형어, 부사어. 독립 성분: 독립어.",
    },
    {
      id: 'ST003', unitCode: 'sentence', type: '빈칸', difficulty: '중',
      passage: '', question: "문장 성분은 크게 주성분, [___], [___]으로 나뉜다.",
      choices: [], answer: '부속 성분/독립 성분', explanation: "문장 성분의 세 갈래: 주성분(주어, 서술어, 목적어, 보어), 부속 성분(관형어, 부사어), 독립 성분(독립어)",
    },
    {
      id: 'ST004', unitCode: 'sentence', type: '단답형', difficulty: '상',
      passage: '', question: "'영희는 학생이 아니다.'에서 '학생이'의 문장 성분은?",
      choices: [], answer: '보어', explanation: "'아니다' 앞에서 '~이/가' 형태로 보충해주는 성분이므로 보어입니다.",
    },
  ];

  if (unitCode) return all.filter(q => q.unitCode === unitCode);
  return all;
}
