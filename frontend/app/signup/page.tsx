import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join KaamKaaj — find jobs or hire talent',
};

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-5 flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-primary">Kaam</span>
              <span className="text-foreground">Kaaj</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join 5 Cr+ users on KaamKaaj
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
