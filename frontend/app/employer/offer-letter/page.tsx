'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Copy, Send, Check, Loader2 } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface FormData {
  candidateName: string;
  candidateEmail: string;
  role: string;
  salary: string;
  startDate: string;
}

export default function OfferLetterPage() {
  const router = useRouter();
  const { toasts, addToast, dismiss } = useToast();

  const [form, setForm] = useState<FormData>({
    candidateName: '', candidateEmail: '', role: '', salary: '', startDate: '',
  });
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [sending,       setSending]       = useState(false);
  const [copied,        setCopied]        = useState(false);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const generate = async () => {
    if (!form.candidateName || !form.role || !form.salary || !form.startDate) {
      addToast({ title: 'Please fill all required fields', variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/employer/offer-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sendEmail: false }),
      });
      const d = await res.json() as { html?: string; error?: string };
      if (res.ok && d.html) {
        setGeneratedHtml(d.html);
        addToast({ title: 'Offer letter generated', variant: 'success' });
      } else {
        addToast({ title: d.error ?? 'Failed to generate', variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const copyHtml = async () => {
    if (!generatedHtml) return;
    await navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({ title: 'HTML copied to clipboard', variant: 'success' });
  };

  const sendLetter = async () => {
    if (!form.candidateEmail || !generatedHtml) {
      addToast({ title: 'Add a candidate email to send', variant: 'error' });
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/employer/offer-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sendEmail: true }),
      });
      const d = await res.json() as { ok?: boolean; error?: string };
      if (res.ok && d.ok) {
        addToast({ title: `Offer letter emailed to ${form.candidateEmail}`, variant: 'success' });
      } else {
        addToast({ title: d.error ?? 'Failed to send email', variant: 'error' });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Offer Letter Generator</h1>
            <p className="text-sm text-muted-foreground">Generate a styled offer letter and email it directly to the candidate.</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">Letter Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: 'candidateName', label: 'Candidate Name', placeholder: 'e.g. Priya Sharma', required: true },
              { key: 'candidateEmail', label: 'Candidate Email', placeholder: 'priya@example.com (for sending)', required: false },
              { key: 'role', label: 'Job Role / Title', placeholder: 'e.g. Senior Frontend Engineer', required: true },
              { key: 'salary', label: 'Salary / Package', placeholder: 'e.g. ₹12 LPA', required: true },
            ].map(({ key, label, placeholder, required }) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  {label} {required && <span className="text-danger">*</span>}
                </label>
                <input
                  value={form[key as keyof FormData]}
                  onChange={set(key as keyof FormData)}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            ))}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                Start Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={set('startDate')}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={generate} disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {loading ? 'Generating…' : 'Generate Letter'}
            </button>
            <button onClick={() => router.back()}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-gray-300">
              Back
            </button>
          </div>
        </div>

        {/* Preview + Actions */}
        {generatedHtml && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Preview</h2>
              <div className="flex items-center gap-2">
                <button onClick={copyHtml}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy HTML'}
                </button>
                <button onClick={sendLetter} disabled={sending || !form.candidateEmail}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-40">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? 'Sending…' : 'Email Candidate'}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div
                className="rounded-lg border border-gray-100 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: generatedHtml }}
              />
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
