import { fetchQuestions } from '@/lib/sheets';
import ReviewQuizContent from './ReviewQuizContent';

export const revalidate = 300;

export default async function ReviewQuizPage() {
  const allQuestions = await fetchQuestions();
  return <ReviewQuizContent allQuestions={allQuestions} />;
}
