'use client';

import { useState } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { useEmployerStore } from '@/store/employerStore';

export default function CompanyProfilePage() {
  const { employer, updateEmployer } = useEmployerStore();

  const [name,     setName]     = useState(employer.name);
  const [industry, setIndustry] = useState(employer.industry);
  const [location, setLocation] = useState(employer.location);
  const [website,  setWebsite]  = useState(employer.website);
  const [about,    setAbout]    = useState(employer.about);
  const [toast,    setToast]    = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployer({ name, industry, location, website, about });
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-gray-600';

  return (
    <EmployerShell>
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Company Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your company information visible to candidates.
        </p>

        {toast && (
          <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            ✓ Profile updated successfully!
          </div>
        )}

        {/* Avatar */}
        <div className="mt-6 flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6B46C1] text-2xl font-extrabold text-white">
            {employer.initials}
          </div>
          <div>
            <p className="font-bold text-gray-900">{employer.name}</p>
            <p className="text-xs text-gray-500">{employer.industry} · {employer.location}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          <div className="rounded-xl bg-white p-6 shadow-sm space-y-5">
            <div>
              <label className={labelCls}>Company Name *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Industry</label>
                <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="company.demo" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>About</label>
              <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4}
                placeholder="Describe your company…"
                className={`${inputCls} resize-none`} />
            </div>
          </div>

          <button type="submit"
            className="w-full rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700">
            Save Profile
          </button>
        </form>
      </div>
    </EmployerShell>
  );
}
