import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UNIVERSITIES, getUniversityBySlug } from '@/data/degreeData';
import { UniversityDetail } from '@/components/degree/UniversityDetail';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return UNIVERSITIES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const uni = getUniversityBySlug(params.slug);
  if (!uni) return { title: 'Not Found | KaamKaaj' };
  return {
    title: `${uni.name} — Online Degree Programs | KaamKaaj`,
    description: `Explore ${uni.name} online programs. NAAC ${uni.naac} accredited, UGC approved. ${uni.courses.length} programs available.`,
    openGraph: {
      title: `${uni.name} — KaamKaaj Degree`,
      description: `NAAC ${uni.naac} • NIRF #${uni.nirfRank} • ${uni.location}`,
      type: 'website',
    },
  };
}

export default function UniversityDetailPage({ params }: Props) {
  const university = getUniversityBySlug(params.slug);
  if (!university) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <UniversityDetail university={university} />
    </div>
  );
}
