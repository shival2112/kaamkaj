'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Building2 } from 'lucide-react';

export interface CompanyRow {
  id: string; name: string; industry: string | null;
  size: string | null; isVerified: boolean; createdAt: string;
  owner: { name: string; email: string };
  _count: { jobs: number };
}

interface EmployerOption { id: string; name: string; email: string; }

interface Props {
  onClose: () => void;
  onCreated: (company: CompanyRow) => void;
}

const INDUSTRIES = [
  'Software & IT Services', 'Banking & Finance', 'Healthcare', 'Education',
  'Retail & E-commerce', 'Manufacturing', 'Consulting', 'Media & Entertainment',
  'Real Estate', 'Logistics', 'Other',
];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

export function AddCompanyModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    name: '', industry: '', size: '', description: '', website: '', ownerId: '',
  });
  const [employers, setEmployers] = useState<EmployerOption[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/users?role=EMPLOYER&page=1')
      .then(r => r.json())
      .then((d: { users?: EmployerOption[] }) => setEmployers(d.users ?? []))
      .catch(() => setEmployers([]))
      .finally(() => setLoadingEmployers(false));
  }, []);

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as CompanyRow & { error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to create company'); return; }
      onCreated(data);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Add New Company</h2>
          </div>
          <button onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Company Name *</label>
              <input required value={form.name} onChange={set('name')}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Industry</label>
              <select value={form.industry} onChange={set('industry')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Company Size</label>
              <select value={form.size} onChange={set('size')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                <option value="">Select size</option>
                {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Website</label>
              <input value={form.website} onChange={set('website')}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Description</label>
              <textarea value={form.description} onChange={set('description')} rows={2}
                placeholder="Brief description of the company"
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Owner (Employer) *</label>
              {loadingEmployers ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading employers…
                </div>
              ) : (
                <select required value={form.ownerId} onChange={set('ownerId')}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                  <option value="">Select an employer account</option>
                  {employers.map(e => (
                    <option key={e.id} value={e.id}>{e.name} — {e.email}</option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">Only users with the Employer role are listed.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || loadingEmployers}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
