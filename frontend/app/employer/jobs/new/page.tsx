'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { useEmployerStore } from '@/store/employerStore';

// Map demo form display values → Prisma DB enum values
const TYPE_TO_DB: Record<string, string> = {
  'Full Time':  'FULL_TIME',
  'Part Time':  'PART_TIME',
  'Contract':   'CONTRACT',
  'Internship': 'INTERNSHIP',
  'Freelance':  'CONTRACT', // closest match
};
const EXP_TO_DB: Record<string, string> = {
  'Fresher':  'FRESHER',
  '0-1 yr':   'JUNIOR',
  '1-3 yrs':  'JUNIOR',
  '3-5 yrs':  'MID',
  '5-8 yrs':  'SENIOR',
  '8+ yrs':   'LEAD',
};

export default function PostJobPage() {
  const router = useRouter();
  const { addJob } = useEmployerStore();

  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills]           = useState<string[]>([]);
  const [skillInput, setSkillInput]   = useState('');
  const [experience, setExperience]   = useState('');
  const [type, setType]               = useState('');
  const [location, setLocation]       = useState('');
  const [openings, setOpenings]       = useState(1);
  const [deadline, setDeadline]       = useState('');
  const [urgent, setUrgent]           = useState(false);

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

    // Try DB persist first (works for Supabase + NextAuth employers).
    // If DB save succeeds we skip addJob() so the listings page shows the real
    // DB record instead of a stale localStorage ghost with a different ID.
    let savedToDb = false;
    try {
      const dbType  = TYPE_TO_DB[type]      ?? 'FULL_TIME';
      const dbLevel = EXP_TO_DB[experience] ?? 'MID';
      const res = await fetch('/api/employer/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, skills, location,
          type:            dbType,
          experienceLevel: dbLevel,
          vacancies:       openings,
        }),
      });
      if (res.ok) {
        const saved = await res.json() as { id: string };
        console.log('[post-job] saved to DB with id', saved.id);
        savedToDb = true;
      } else {
        const body = await res.json() as { error?: string };
        // 401 = demo-only user with no real session — expected, fall through to localStorage
        if (res.status !== 401) console.warn('[post-job] DB save failed:', body.error);
      }
    } catch (err) {
      console.warn('[post-job] DB save error (non-fatal):', err);
    }

    // Only add to localStorage if DB save was not possible (pure demo users).
    // For authenticated users the listings page fetches from the API on mount,
    // so the real DB record appears without needing a localStorage mirror.
    if (!savedToDb) {
      addJob({
        id: `j${Date.now()}`, title, description, skills, experience, type, location,
        openings, deadline, urgent, status: 'active',
        postedDate: new Date().toISOString().slice(0, 10),
        views: 0,
      });
    }

    router.push('/employer/jobs');
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-gray-600';

  return (
    <EmployerShell>
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Post a Job</h1>
        <p className="mt-1 text-sm text-gray-500">Fill in the details to create a new job listing.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className={labelCls}>Job Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Description *</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} placeholder="Describe the role and responsibilities..."
              className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Skills (press Enter to add)</label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 p-3 focus-within:border-[#6B46C1]">
              {skills.map((s) => (
                <span key={s} className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  {s}
                  <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={onSkillKey} placeholder="Type a skill…"
                className="min-w-[120px] flex-1 bg-transparent text-sm focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Experience *</label>
              <select required value={experience} onChange={(e) => setExperience(e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {['Fresher', '0-1 yr', '1-3 yrs', '3-5 yrs', '5-8 yrs', '8+ yrs'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Job Type *</label>
              <select required value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Location *</label>
              <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bangalore or Remote" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Openings</label>
              <input type="number" min={1} value={openings} onChange={(e) => setOpenings(Number(e.target.value))} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Application Deadline</label>
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
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700">
              Post Job
            </button>
          </div>
        </form>
      </div>
    </EmployerShell>
  );
}
