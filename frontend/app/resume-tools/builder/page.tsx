import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import { ResumeBuilderClient } from '@/components/resume/ResumeBuilderClient';
import type { ResumeData } from '@/components/resume/ResumeBuilderClient';

export const metadata: Metadata = {
  title: 'Resume Builder | KaamKaaj',
  description: 'Build your professional resume for free. Fill the form, preview live and download as PDF.',
};

export default async function ResumeBuilderPage() {
  let initialData: Partial<ResumeData> | undefined;
  let isLoggedIn = false;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login?next=/resume-tools/builder');
    }

    if (user) {
      isLoggedIn = true;
      const [dbUser, resume] = await Promise.all([
        prisma.user.findUnique({
          where:  { id: user.id },
          select: { name: true, email: true, phone: true },
        }),
        prisma.resume.findUnique({
          where:  { userId: user.id },
          select: { parsedData: true },
        }),
      ]);

      const pd = (resume?.parsedData as Record<string, unknown>) ?? {};

      // Check if there's previously saved resume builder data
      const saved = pd.resumeBuilderData as Partial<ResumeData> | undefined;

      if (saved) {
        initialData = saved;
      } else {
        // Pre-fill from profile data
        initialData = {
          personalInfo: {
            name:     dbUser?.name  ?? '',
            email:    dbUser?.email ?? '',
            phone:    dbUser?.phone ?? '',
            location: (pd.location as string) ?? '',
            linkedin: '',
          },
          summary: (pd.bio as string) ?? '',
          skills:  (pd.skills as string[]) ?? [],
        };
      }
    }
  } catch {
    // Not fatal — render empty builder
  }

  return <ResumeBuilderClient initialData={initialData} isLoggedIn={isLoggedIn} />;
}
