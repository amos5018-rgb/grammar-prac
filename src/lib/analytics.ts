import { Question } from './types';

export type AnalyticsMode =
  | 'unit_full'
  | 'unit_random_5'
  | 'unit_random_10'
  | 'block_full'
  | 'block_random_5'
  | 'category_mixed_10'
  | 'review_all'
  | 'review_random'
  | 'review_due'
  | 'review_wrong_top'
  | 'review_unit'
  | 'review_block'
  | 'study_cards'
  | 'unknown';

export interface AttemptSessionRecord {
  attemptId: string;
  unitCode: string;
  mode: AnalyticsMode;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  score: number;
  total: number;
  completed: boolean;
  exitReason: string;
}

export interface ModeSelectionEventRecord {
  eventId: string;
  selectedAt: string;
  sourceScreen: string;
  sourceComponent: string;
  selectedMode: AnalyticsMode;
  unitCode?: string;
  categoryCode?: string;
  blockCode?: string;
  requestedCount?: number;
  availableModes?: AnalyticsMode[];
  availableQuestionCount?: number;
  wrongCountAvailable?: number;
  dueCountAvailable?: number;
  unitAttempts?: number;
  unitBestScore?: number | null;
  unitTier?: string;
  coveragePct?: number;
}

export interface AnswerMetricRecord {
  attemptId: string;
  questionId: string;
  unitCode: string;
  questionType: string;
  difficulty: string;
  block?: string;
  questionOrder: number;
  correct: boolean;
  studentAnswer: string;
  correctAnswer: string;
  responseMs: number;
  firstActionMs: number | null;
  feedbackDwellMs: number;
  answerChangeCount: number;
  selectionCount: number;
}

export interface QuizEventRecord {
  eventId: string;
  attemptId: string;
  questionId?: string;
  eventType:
    | 'question_view'
    | 'choice_select'
    | 'submit'
    | 'feedback_view'
    | 'next_question'
    | 'exit_attempt'
    | 'mode_select';
  eventAt: string;
  elapsedMs: number;
  payload?: Record<string, unknown>;
}

export interface RecommendationEventRecord {
  eventId: string;
  recommendationType: string;
  href: string;
  shownAt: string;
  clicked: boolean;
  clickedAt?: string;
  ledToMode?: AnalyticsMode;
  urgent?: boolean;
  dday?: number;
}

export interface AnalyticsQueue {
  attemptSessions: AttemptSessionRecord[];
  modeSelectionEvents: ModeSelectionEventRecord[];
  answerMetrics: AnswerMetricRecord[];
  quizEvents: QuizEventRecord[];
  recommendationEvents: RecommendationEventRecord[];
}

const ANALYTICS_QUEUE_KEY = 'grammar_analytics_queue_v1';
const MAX_ATTEMPT_SESSIONS = 300;
const MAX_MODE_EVENTS = 500;
const MAX_ANSWER_METRICS = 1200;
const MAX_QUIZ_EVENTS = 1200;
const MAX_RECOMMENDATION_EVENTS = 400;
let analyticsSyncScheduled = false;

function emptyQueue(): AnalyticsQueue {
  return {
    attemptSessions: [],
    modeSelectionEvents: [],
    answerMetrics: [],
    quizEvents: [],
    recommendationEvents: [],
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function createAnalyticsId(prefix = 'evt'): string {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}:${id}`;
}

function trimQueue(q: AnalyticsQueue): AnalyticsQueue {
  return {
    attemptSessions: q.attemptSessions.slice(-MAX_ATTEMPT_SESSIONS),
    modeSelectionEvents: q.modeSelectionEvents.slice(-MAX_MODE_EVENTS),
    answerMetrics: q.answerMetrics.slice(-MAX_ANSWER_METRICS),
    quizEvents: q.quizEvents.slice(-MAX_QUIZ_EVENTS),
    recommendationEvents: q.recommendationEvents.slice(-MAX_RECOMMENDATION_EVENTS),
  };
}

export function getAnalyticsQueue(): AnalyticsQueue {
  if (!isBrowser()) return emptyQueue();
  try {
    const raw = localStorage.getItem(ANALYTICS_QUEUE_KEY);
    if (!raw) return emptyQueue();
    return { ...emptyQueue(), ...JSON.parse(raw) };
  } catch {
    return emptyQueue();
  }
}

export function clearAnalyticsQueue() {
  if (!isBrowser()) return;
  localStorage.removeItem(ANALYTICS_QUEUE_KEY);
}

function answerMetricKey(m: AnswerMetricRecord): string {
  return `${m.attemptId}|${m.questionId}`;
}

export function discardSyncedAnalytics(sent: AnalyticsQueue) {
  if (!isBrowser()) return;
  const current = getAnalyticsQueue();
  const sentAttemptIds = new Set(sent.attemptSessions.map(r => r.attemptId));
  const sentModeEventIds = new Set(sent.modeSelectionEvents.map(r => r.eventId));
  const sentMetricKeys = new Set(sent.answerMetrics.map(answerMetricKey));
  const sentQuizEventIds = new Set(sent.quizEvents.map(r => r.eventId));
  const sentRecommendationEventIds = new Set(sent.recommendationEvents.map(r => r.eventId));

  const next = {
    attemptSessions: current.attemptSessions.filter(r => !sentAttemptIds.has(r.attemptId)),
    modeSelectionEvents: current.modeSelectionEvents.filter(r => !sentModeEventIds.has(r.eventId)),
    answerMetrics: current.answerMetrics.filter(r => !sentMetricKeys.has(answerMetricKey(r))),
    quizEvents: current.quizEvents.filter(r => !sentQuizEventIds.has(r.eventId)),
    recommendationEvents: current.recommendationEvents.filter(r => !sentRecommendationEventIds.has(r.eventId)),
  };

  if (
    next.attemptSessions.length === 0 &&
    next.modeSelectionEvents.length === 0 &&
    next.answerMetrics.length === 0 &&
    next.quizEvents.length === 0 &&
    next.recommendationEvents.length === 0
  ) {
    clearAnalyticsQueue();
    return;
  }

  saveQueue(next);
}

function saveQueue(q: AnalyticsQueue) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(trimQueue(q)));
    scheduleAnalyticsSync();
  } catch {
    // Keep student flow fast and quiet even if storage is full.
  }
}

export function scheduleAnalyticsSync() {
  if (!isBrowser() || analyticsSyncScheduled) return;
  analyticsSyncScheduled = true;

  const run = () => {
    analyticsSyncScheduled = false;
    import('./sync')
      .then(m => m.syncNow())
      .catch(() => {});
  };

  const idle = (window as Window & {
    requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (idle) {
    idle(run, { timeout: 6000 });
    return;
  }
  window.setTimeout(run, 3000);
}

function appendQueue(patch: Partial<AnalyticsQueue>) {
  if (!isBrowser()) return;
  const q = getAnalyticsQueue();
  saveQueue({
    attemptSessions: [...q.attemptSessions, ...(patch.attemptSessions ?? [])],
    modeSelectionEvents: [...q.modeSelectionEvents, ...(patch.modeSelectionEvents ?? [])],
    answerMetrics: [...q.answerMetrics, ...(patch.answerMetrics ?? [])],
    quizEvents: [...q.quizEvents, ...(patch.quizEvents ?? [])],
    recommendationEvents: [...q.recommendationEvents, ...(patch.recommendationEvents ?? [])],
  });
}

export function enqueueAttemptSession(record: AttemptSessionRecord) {
  appendQueue({ attemptSessions: [record] });
}

export function enqueueAnswerMetric(record: AnswerMetricRecord) {
  appendQueue({ answerMetrics: [record] });
}

export function enqueueQuizEvent(record: Omit<QuizEventRecord, 'eventId' | 'eventAt'>) {
  appendQueue({
    quizEvents: [{
      ...record,
      eventId: createAnalyticsId('quiz'),
      eventAt: new Date().toISOString(),
    }],
  });
}

export function trackModeSelection(record: Omit<ModeSelectionEventRecord, 'eventId' | 'selectedAt'>) {
  appendQueue({
    modeSelectionEvents: [{
      ...record,
      eventId: createAnalyticsId('mode'),
      selectedAt: new Date().toISOString(),
    }],
    quizEvents: [{
      eventId: createAnalyticsId('quiz'),
      attemptId: createAnalyticsId('pending-mode'),
      eventType: 'mode_select',
      eventAt: new Date().toISOString(),
      elapsedMs: 0,
      payload: {
        mode: record.selectedMode,
        sourceScreen: record.sourceScreen,
        sourceComponent: record.sourceComponent,
        unitCode: record.unitCode,
        categoryCode: record.categoryCode,
        blockCode: record.blockCode,
      },
    }],
  });
}

export function trackRecommendationShown(record: Omit<RecommendationEventRecord, 'eventId' | 'shownAt' | 'clicked'>) {
  appendQueue({
    recommendationEvents: [{
      ...record,
      eventId: createAnalyticsId('rec'),
      shownAt: new Date().toISOString(),
      clicked: false,
    }],
  });
}

export function trackRecommendationClicked(record: Omit<RecommendationEventRecord, 'eventId' | 'shownAt' | 'clicked' | 'clickedAt'>) {
  const now = new Date().toISOString();
  appendQueue({
    recommendationEvents: [{
      ...record,
      eventId: createAnalyticsId('rec'),
      shownAt: now,
      clicked: true,
      clickedAt: now,
    }],
  });
}

export function inferModeFromHref(href: string): AnalyticsMode {
  if (href.includes('/category/') && href.includes('/mixed')) return 'category_mixed_10';
  if (href.includes('/review/quiz')) {
    if (href.includes('wrong=1')) return 'review_wrong_top';
    if (href.includes('due=1')) return 'review_due';
    if (href.includes('block=')) return 'review_block';
    if (href.includes('n=')) return 'review_random';
    if (href.includes('unit=')) return 'review_unit';
    return 'review_all';
  }
  if (href.includes('/study')) return 'study_cards';
  if (href.includes('block=') && href.includes('n=5')) return 'block_random_5';
  if (href.includes('block=')) return 'block_full';
  if (href.includes('n=10')) return 'unit_random_10';
  if (href.includes('n=5')) return 'unit_random_5';
  if (href.includes('/quiz')) return 'unit_full';
  return 'unknown';
}

export function questionMeta(question: Question) {
  return {
    questionId: question.id,
    unitCode: question.unitCode,
    questionType: question.type,
    difficulty: question.difficulty,
    block: question.block,
  };
}
