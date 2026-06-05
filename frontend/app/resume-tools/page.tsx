import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Download, Eye, Zap, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Resume Tools | KaamKaaj',
  description: 'Build a professional resume for free. Use our easy resume builder to create, preview and download your resume instantly.',
};

const FEATURES = [
  { icon: Zap,          text: 'Build in minutes with a guided form' },
  { icon: Eye,          text: 'Live preview as you type' },
  { icon: Download,     text: 'Download as PDF — completely free' },
  { icon: CheckCircle,  text: 'Save & edit anytime if you\'re logged in' },
];

export default function ResumeToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Resume Builder
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Create a professional resume in minutes — 100% free, no sign-up required.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/resume-tools/builder"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <FileText className="h-5 w-5" />
              Build My Resume
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Browse Jobs
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="pt-1.5 text-sm font-medium text-foreground">{text}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-xl font-semibold text-foreground">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { step: '1', title: 'Fill the form', desc: 'Enter your personal details, work experience, education and skills.' },
              { step: '2', title: 'Preview live',  desc: 'See your professional resume update in real time on the right panel.' },
              { step: '3', title: 'Download PDF',  desc: 'Click Download to save your resume as a PDF using browser print.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center rounded-xl border border-border bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {step}
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/resume-tools/builder"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 text-base font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <FileText className="h-5 w-5" />
            Start Building — It&apos;s Free
          </Link>
        </div>
      </div>
    </div>
  );
}
