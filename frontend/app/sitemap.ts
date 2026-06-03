import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kaamkaaj.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [jobs, companies] = await Promise.all([
    prisma.job.findMany({
      where:  { status: JobStatus.ACTIVE },
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.company.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/jobs`,    lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/companies`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/job-prep`,  lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/contests`,  lastModified: now, changeFrequency: 'daily',  priority: 0.6 },
    { url: `${BASE}/degree`,    lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE}/login`,     lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/signup`,    lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((j) => ({
    url:             `${BASE}/jobs/${j.id}`,
    lastModified:    j.updatedAt,
    changeFrequency: 'weekly',
    priority:        0.7,
  }));

  const companyRoutes: MetadataRoute.Sitemap = companies.map((c) => ({
    url:             `${BASE}/companies/${c.id}`,
    lastModified:    c.updatedAt,
    changeFrequency: 'weekly',
    priority:        0.6,
  }));

  return [...staticRoutes, ...jobRoutes, ...companyRoutes];
}
