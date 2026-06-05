import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Terms of Service | KaamKaaj' };
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        {[
          { title: 'Acceptance', body: 'By using KaamKaaj you agree to these terms. If you do not agree, please do not use the platform.' },
          { title: 'User Accounts', body: 'You are responsible for keeping your account credentials secure. You must not share your account or use KaamKaaj for any unlawful purpose.' },
          { title: 'Job Listings', body: 'Employers must only post genuine job opportunities. Fake, duplicate, or misleading listings will be removed and the account suspended.' },
          { title: 'Applications', body: 'Candidates may apply to up to 10 jobs per 24 hours. Spamming employers or submitting fraudulent applications is prohibited.' },
          { title: 'Content', body: 'Users may not post offensive, discriminatory, or copyrighted content. KaamKaaj reserves the right to remove any content that violates these terms.' },
          { title: 'Liability', body: 'KaamKaaj is a platform connecting candidates and employers. We are not responsible for the accuracy of job listings or the outcome of hiring decisions.' },
          { title: 'Termination', body: 'We may suspend or terminate accounts that violate these terms without prior notice.' },
          { title: 'Contact', body: 'For terms-related enquiries, contact legal@kaamkaaj.com.' },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-foreground mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
