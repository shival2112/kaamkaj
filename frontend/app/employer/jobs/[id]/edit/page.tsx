'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { X } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { useEmployerStore } from '@/store/employerStore';

// Map demo display values → DB enums (same as post-job page)
const TYPE_TO_DB: Record<string, string> = {
  'Full Time':  'FULL_TIME',
  'Part Time':  'PART_TIME',
  'Contract':   'CONTRACT',
  'Internship': 'INTERNSHIP',
  'Freelance':  'CONTRACT',
};
const EXP_TO_DB: Record<string, string> = {
  'Fresher':  'FRESHER',
  '0-1 yr':   'JUNIOR',
  '1-3 yrs':  'JUNIOR',
  '3-5 yrs':  'MID',
  '5-8 yrs':  'SENIOR',
  '8+ yrs':   'LEAD',
};

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { jobs, updateJob } = useEmployerStore();

  const job = jobs.find((j) => j.id === params.id);

  const [title,       setTitle]       = useState(job?.title       ?? '');
  const [description, setDescription] = useState(job?.description ?? '');
  const [skills,      setSkills]      = useState<string[]>(job?.skills ?? []);
  const [skillInput,  setSkillInput]  = useState('');
  const [experience,  setExperience]  = useState(job?.experience  ?? '');
  const [type,        setType]        = useState(job?.type        ?? '');
  const [location,    setLocation]    = useState(job?.location    ?? '');
  const [openings,    setOpenings]    = useState(job?.openings    ?? 1);
  const [deadline,    setDeadline]    = useState(job?.deadline    ?? '');
  const [urgent,      setUrgent]      = useState(job?.urgent      ?? false);

  if (!job) return notFound();

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  };
  const onSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update localStorage (demo / phone-OTP users)
    updateJob(job.id, { title, description, skills, experience, type, location, openings, deadline, urgent });

    // 2. Best-effort DB update for Supabase-authenticated employers
    try {
      const dbType  = TYPE_TO_DB[type]       ?? type;
      const dbLevel = EXP_TO_DB[experience]  ?? 'MID';
      const res = await fetch(`/api/employer/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, skills, location,
          type:            dbType,
          experienceLevel: dbLevel,
          vacancies:       openings,
        }),
      });
      if (res.ok) {
        console.log('[edit-job] updated in DB:', job.id);
      } else if (res.status !== 401 && res.status !== 404) {
        const body = await res.json() as { error?: string };
        console.warn('[edit-job] DB update failed:', body.error);
      }
    } catch (err) {
      console.warn('[edit-job] DB update error (non-fatal):', err);
    }

    router.push(`/employer/jobs/${job.id}`);
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-gray-600';

  return (
    <EmployerShell>
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Edit Job</h1>
        <p className="mt-1 text-sm text-gray-500">Update the listing details below.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className={labelCls}>Job Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Skills (Enter to add)</label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 p-3 focus-within:border-[#6B46C1]">
              {skills.map((s) => (
                <span key={s} className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  {s}
                  <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}><X className="h-3 w-3" /></button>
                </span>
              ))}
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={onSkillKey}
                placeholder="Add skill…" className="min-w-[120px] flex-1 bg-transparent text-sm focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Experience</label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className={inputCls}>
                {['Fresher', '0-1 yr', '1-3 yrs', '3-5 yrs', '5-8 yrs', '8+ yrs'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Job Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
                {['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Openings</label>
              <input type="number" min={1} value={openings} onChange={(e) => setOpenings(Number(e.target.value))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
            <button type="button" onClick={() => setUrgent(!urgent)}
              className={`relative h-6 w-11 rounded-full transition-colors ${urgent ? 'bg-[#6B46C1]' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${urgent ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">Urgently Hiring</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="flex-1 rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700">Save Changes</button>
          </div>
        </form>
      </div>
    </EmployerShell>
  );
}
