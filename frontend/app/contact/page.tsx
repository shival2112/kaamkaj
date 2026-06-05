import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = { title: 'Contact Us | KaamKaaj' };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">We&apos;d love to hear from you. Reach out with questions, feedback, or partnership enquiries.</p>
        <div className="mt-10 space-y-5">
          {[
            { icon: Mail,    label: 'Email',    value: 'support@kaamkaaj.com' },
            { icon: Phone,   label: 'Phone',    value: '+91 98765 43210' },
            { icon: MapPin,  label: 'Address',  value: 'KaamKaaj Technologies Pvt. Ltd., Mumbai, Maharashtra 400001' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
