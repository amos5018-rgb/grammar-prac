import { fetchQuestions } from '@/lib/sheets';
import ReviewContent from './ReviewContent';

export const revalidate = 300;

export default async function ReviewPage() {
  const allQuestions = await fetchQuestions();
  return <ReviewContent allQuestions={allQuestions} />;
}
