import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy Policy | KaamKaaj' };
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        {[
          { title: 'Information We Collect', body: 'We collect your name, email, phone number, resume, and job application data when you register and use KaamKaaj. We also collect usage data (pages visited, searches performed) to improve the platform.' },
          { title: 'How We Use Your Information', body: 'Your data is used to match you with jobs, send application updates, and improve our platform. We do not sell your personal data to third parties.' },
          { title: 'Data Storage', body: 'Your data is stored securely on Supabase (AWS ap-northeast-1). All connections use TLS encryption. Passwords are never stored in plain text.' },
          { title: 'Your Rights', body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting support@kaamkaaj.com. You can also delete your account from your dashboard settings.' },
          { title: 'Cookies', body: 'We use session cookies for authentication. We do not use tracking or advertising cookies.' },
          { title: 'Contact', body: 'For privacy-related queries, contact us at privacy@kaamkaaj.com.' },
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
