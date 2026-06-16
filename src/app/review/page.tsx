import { fetchQuestions } from '@/lib/sheets';
import ReviewContent from './ReviewContent';

export const revalidate = 3600;

export default async function ReviewPage() {
  const allQuestions = await fetchQuestions();
  return <ReviewContent allQuestions={allQuestions} />;
}
