import { notFound } from 'next/navigation';
import { getPrepBySlug, PREP_DATA } from '@/data/jobPrepData';
import { PracticeSession } from '@/components/job-prep/PracticeSession';

interface Props {
  params: { slug: string; roundIndex: string; questionIndex: string };
}

export function generateStaticParams() {
  const out: Array<{ slug: string; roundIndex: string; questionIndex: string }> = [];
  for (const entry of PREP_DATA) {
    entry.rounds.forEach((round, ri) => {
      round.questions.forEach((_, qi) => {
        out.push({ slug: entry.slug, roundIndex: String(ri), questionIndex: String(qi) });
      });
    });
  }
  return out;
}

export default function PracticePage({ params }: Props) {
  const roundIndex = parseInt(params.roundIndex, 10);
  const questionIndex = parseInt(params.questionIndex, 10);

  if (isNaN(roundIndex) || isNaN(questionIndex)) notFound();

  const entry = getPrepBySlug(params.slug);
  if (!entry || !entry.rounds[roundIndex] || !entry.rounds[roundIndex].questions[questionIndex]) {
    notFound();
  }

  return (
    <PracticeSession
      key={`${params.slug}-${roundIndex}-${questionIndex}`}
      slug={params.slug}
      roundIndex={roundIndex}
      questionIndex={questionIndex}
    />
  );
}
