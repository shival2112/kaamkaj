import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'About Us | KaamKaaj' };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">About KaamKaaj</h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            KaamKaaj is India&apos;s growing job platform connecting talented professionals with amazing opportunities — completely free for job seekers.
          </p>
        </div>
        {[
          { title: 'Our Mission', body: 'To eliminate barriers between job seekers and employers across India, making the hiring process simple, transparent, and accessible to everyone — from freshers to senior professionals.' },
          { title: 'What We Offer', body: 'Over 50 lakh job listings across every industry and city in India. Smart matching, resume tools, job alerts, interview prep, and a transparent application tracking system.' },
          { title: 'For Employers', body: 'Post jobs for free, manage applications with our powerful employer dashboard, schedule interviews, and find the right candidate faster with AI-powered matching.' },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-foreground mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
        <div className="flex gap-4">
          <Link href="/jobs" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">Browse Jobs</Link>
          <Link href="/contact" className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
