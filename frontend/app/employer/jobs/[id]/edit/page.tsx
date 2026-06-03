'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';

// ─── DB enum maps ─────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: 'Full Time',   value: 'FULL_TIME' },
  { label: 'Part Time',   value: 'PART_TIME' },
  { label: 'Remote',      value: 'REMOTE' },
  { label: 'Contract',    value: 'CONTRACT' },
  { label: 'Internship',  value: 'INTERNSHIP' },
];

const EXP_OPTIONS = [
  { label: 'Fresher',    value: 'FRESHER' },
  { label: '1–3 yrs',   value: 'JUNIOR' },
  { label: '3–6 yrs',   value: 'MID' },
  { label: '6–10 yrs',  value: 'SENIOR' },
  { label: '10+ yrs',   value: 'LEAD' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbJob {
  id: string; title: string; description: string; location: string;
  type: string; experienceLevel: string; salaryMin: number | null;
  salaryMax: number | null; vacancies: number; skills: string[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');

  // Form fields — initialised from API
  const [title,        setTitle]       = useState('');
  const [description,  setDescription] = useState('');
  const [location,     setLocation]    = useState('');
  const [type,         setType]        = useState('FULL_TIME');
  const [expLevel,     setExpLevel]    = useState('FRESHER');
  const [salaryMin,    setSalaryMin]   = useState('');
  const [salaryMax,    setSalaryMax]   = useState('');
  const [vacancies,    setVacancies]   = useState(1);
  const [skills,       setSkills]      = useState<string[]>([]);
  const [skillInput,   setSkillInput]  = useState('');

  // Fetch job from DB on mount
  useEffect(() => {
    fetch(`/api/employer/jobs/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((job: DbJob) => {
        setTitle(job.title);
        setDescription(job.description);
        setLocation(job.location);
        setType(job.type);
        setExpLevel(job.experienceLevel);
        setSalaryMin(job.salaryMin != null ? String(job.salaryMin) : '');
        setSalaryMax(job.salaryMax != null ? String(job.salaryMax) : '');
        setVacancies(job.vacancies);
        setSkills(job.skills);
      })
      .catch(err => {
        console.error('[edit-job] load failed:', err);
        setError('Could not load job. It may have been deleted or you don\'t have access.');
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };
  const onSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/employer/jobs/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:           title.trim(),
          description:     description.trim(),
          location:        location.trim(),
          type,
          experienceLevel: expLevel,
          salaryMin:       salaryMin ? Number(salaryMin) : null,
          salaryMax:       salaryMax ? Number(salaryMax) : null,
          vacancies:       Number(vacancies),
          skills,
        }),
      });

      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? `Server error ${res.status}`);
      }

      setSaved(true);
      setTimeout(() => router.push('/employer/jobs'), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-gray-600';

  return (
    <EmployerShell>
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Edit Job</h1>
        <p className="mt-1 text-sm text-gray-500">Update the listing details below.</p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#6B46C1]" />
          </div>
        ) : error && !title ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {saved && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                <CheckCircle2 className="h-4 w-4" /> Saved! Redirecting…
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            {/* Title */}
            <div>
              <label className={labelCls}>Job Title *</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={5} className={`${inputCls} resize-none`} />
            </div>

            {/* Skills */}
            <div>
              <label className={labelCls}>Skills (press Enter to add)</label>
              <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 p-3 focus-within:border-[#6B46C1]">
                {skills.map(s => (
                  <span key={s} className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={onSkillKey}
                  onBlur={addSkill}
                  placeholder="Add skill…"
                  className="min-w-[120px] flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Type + Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Job Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Experience Level</label>
                <select value={expLevel} onChange={e => setExpLevel(e.target.value)} className={inputCls}>
                  {EXP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Location + Vacancies */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Openings</label>
                <input type="number" min={1} value={vacancies}
                  onChange={e => setVacancies(Number(e.target.value))} className={inputCls} />
              </div>
            </div>

            {/* Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Salary Min (₹/yr)</label>
                <input type="number" min={0} value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  placeholder="e.g. 300000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Salary Max (₹/yr)</label>
                <input type="number" min={0} value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  placeholder="e.g. 600000" className={inputCls} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => router.back()}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving || saved}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </EmployerShell>
  );
}
