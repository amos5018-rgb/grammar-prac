// ============================================================
// 데이터 불러오기
// - 기본: src/data/ 폴더의 로컬 문제 데이터 사용 (빠름, 관리 쉬움)
// - 선택: 환경변수 GOOGLE_SHEET_ID를 설정하면 Google Sheets 데이터가
//         로컬 데이터 대신 사용됨 (5분마다 자동 갱신)
// ============================================================
import { Unit, Question, QuestionType, Difficulty, StudyCard } from './types';
import { units as localUnits } from '@/data/units';
import { allQuestions as localQuestions } from '@/data/questions';
import { allStudyCards } from '@/data/study';

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
  if (rows.length <= 1) {
    return [...localUnits]
      .filter(u => u.active && u.code)
      .sort((a, b) => a.order - b.order);
  }

  return rows
    .slice(1)
    .map(row => ({
      code: row[0] || '',
      name: row[1] || '',
      description: row[2] || '',
      order: parseInt(row[3]) || 0,
      active: row[4]?.toUpperCase() === 'TRUE',
      category: row[5] || 'etc', // 시트에 중분류 열이 없으면 '기타'로 분류
      advanced: row[6]?.toUpperCase() === 'TRUE', // 고난도 열(TRUE/FALSE)
      study: row[7]?.toUpperCase() === 'TRUE',
    }))
    .filter(u => u.active && u.code)
    .sort((a, b) => a.order - b.order);
}

export async function fetchQuestions(unitCode?: string): Promise<Question[]> {
  const rows = await fetchSheet('문제');
  if (rows.length <= 1) {
    if (unitCode) return localQuestions.filter(q => q.unitCode === unitCode);
    return localQuestions;
  }

  const questions = rows.slice(1).map(row => ({
    id: row[0] || '',
    unitCode: row[1] || '',
    type: (row[2] || '객관식') as QuestionType,
    difficulty: (row[3] || '중') as Difficulty,
    passage: row[4] || '',
    question: row[5] || '',
    choices: [row[6], row[7], row[8], row[9], row[10]].filter(c => c && c.trim() !== ''),
    answer: row[11] || '',
    explanation: row[12] || '',
  }));

  if (unitCode) return questions.filter(q => q.unitCode === unitCode);
  return questions;
}

export function fetchStudyCards(unitCode: string): StudyCard[] {
  return allStudyCards[unitCode] || [];
}
