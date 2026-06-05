'use client';

import { useState, useEffect } from 'react';
import { Building2, Globe, Users, FileText, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { useRouter } from 'next/navigation';

const INDUSTRIES = [
  'Software & IT Services', 'Banking & Finance', 'Healthcare', 'Education',
  'Retail & E-commerce', 'Manufacturing', 'Consulting', 'Media & Entertainment',
  'Real Estate', 'Logistics', 'Other',
];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

interface Company {
  id?: string; name: string; industry: string | null;
  size: string | null; website: string | null; description: string | null;
  isVerified?: boolean;
}

export default function CompanyProfilePage() {
  const [company,  setCompany]  = useState<Company | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  // Form state
  const [name,        setName]        = useState('');
  const [industry,    setIndustry]    = useState('');
  const [size,        setSize]        = useState('');
  const [website,     setWebsite]     = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch('/api/employer/company')
      .then(r => r.json())
      .then((d: { company?: Company | null }) => {
        const c = d.company;
        if (c) {
          setCompany(c);
          setName(c.name ?? '');
          setIndustry(c.industry ?? '');
          setSize(c.size ?? '');
          setWebsite(c.website ?? '');
          setDescription(c.description ?? '');
        }
      })
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch('/api/employer/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, size, website, description }),
      });
      const data = await res.json() as { company?: Company; error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to save.'); return; }
      setCompany(data.company ?? null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-gray-600';

  return (
    <EmployerShell>
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <Building2 className="h-5 w-5 text-[#6B46C1]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Company Profile</h1>
            <p className="text-xs text-gray-500">Visible to candidates on your job listings</p>
          </div>
          {company?.isVerified && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {success && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                ✓ Company profile saved successfully!
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            {/* Company name */}
            <div>
              <label className={labelCls}>
                <Building2 className="mr-1.5 inline h-3.5 w-3.5" />
                Company Name *
              </label>
              <input
                required value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Acme Technologies Pvt. Ltd."
                className={inputCls}
              />
            </div>

            {/* Industry + Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Industry</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)} className={inputCls}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  <Users className="mr-1.5 inline h-3.5 w-3.5" />
                  Company Size
                </label>
                <select value={size} onChange={e => setSize(e.target.value)} className={inputCls}>
                  <option value="">Select size</option>
                  {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
            </div>

            {/* Website */}
            <div>
              <label className={labelCls}>
                <Globe className="mr-1.5 inline h-3.5 w-3.5" />
                Website
              </label>
              <input
                type="url" value={website} onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>
                <FileText className="mr-1.5 inline h-3.5 w-3.5" />
                About the Company
              </label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe your company culture, mission, and what makes it a great place to work…"
                rows={5} maxLength={1000}
                className={`${inputCls} resize-none`}
              />
              <p className="mt-1 text-right text-xs text-gray-400">{description.length}/1000</p>
            </div>

            <button
              type="submit" disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'Saving…' : 'Save Company Profile'}
            </button>
          </form>
        )}

        {/* Danger Zone */}
        <div className="mt-8 rounded-xl border border-red-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-red-600">Danger Zone</h2>
          <p className="mb-4 text-xs text-gray-500">Permanently delete your employer account and all associated jobs. This cannot be undone.</p>
          <DeleteAccountButton />
        </div>
      </div>
    </EmployerShell>
  );
}

function DeleteAccountButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        if (!confirm('Delete your employer account and all jobs? This cannot be undone.')) return;
        const res = await fetch('/api/candidate/account', { method: 'DELETE' });
        if (res.ok) { router.push('/'); }
        else { const d = await res.json() as { error?: string }; alert(d.error ?? 'Failed.'); }
      }}
      className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
    >
      <Trash2 className="h-4 w-4" />
      Delete Employer Account
    </button>
  );
}
