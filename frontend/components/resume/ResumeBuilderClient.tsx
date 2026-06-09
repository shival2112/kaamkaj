'use client';

import { useState, useCallback } from 'react';
import {
  Plus, Trash2, Download, Save, CheckCircle, Loader2,
  User, Briefcase, GraduationCap, Star, FileText, FilePlus,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  degree: string;
  school: string;
  location: string;
  startYear: string;
  endYear: string;
  grade: string;
}

export interface ResumeData {
  personalInfo: { name: string; email: string; phone: string; location: string; linkedin: string; };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
}

interface Props {
  initialData?: Partial<ResumeData>;
  isLoggedIn: boolean;
}

const emptyExp = (): ExperienceEntry => ({
  id: Date.now().toString(),
  jobTitle: '', company: '', location: '',
  startDate: '', endDate: '', current: false, description: '',
});

const emptyEdu = (): EducationEntry => ({
  id: Date.now().toString(),
  degree: '', school: '', location: '', startYear: '', endYear: '', grade: '',
});

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Input helpers ─────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const labelCls = 'mb-1 block text-xs font-medium text-muted-foreground';

// ── Resume Preview ────────────────────────────────────────────────────────────

function ResumePreview({ data }: { data: ResumeData }) {
  const { personalInfo: pi, summary, experience, education, skills } = data;
  return (
    <div
      id="resume-preview"
      className="bg-white text-[#111] font-sans"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px', lineHeight: '1.5' }}
    >
      {/* Header */}
      <div style={{ borderBottom: '2px solid #5B5BD6', paddingBottom: '12px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#111' }}>
          {pi.name || 'Your Name'}
        </h1>
        <div style={{ marginTop: '4px', color: '#555', fontSize: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {pi.email    && <span>{pi.email}</span>}
          {pi.phone    && <span>{pi.phone}</span>}
          {pi.location && <span>{pi.location}</span>}
          {pi.linkedin && <span>{pi.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5B5BD6', marginBottom: '6px', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>
            Professional Summary
          </h2>
          <p style={{ margin: 0, color: '#333' }}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.some(e => e.jobTitle || e.company) && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5B5BD6', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>
            Work Experience
          </h2>
          {experience.filter(e => e.jobTitle || e.company).map(exp => (
            <div key={exp.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 700, margin: 0 }}>{exp.jobTitle}</p>
                  <p style={{ color: '#555', margin: 0 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                </div>
                <p style={{ color: '#777', fontSize: '12px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {exp.startDate}{(exp.startDate || exp.endDate) ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}
                </p>
              </div>
              {exp.description && (
                <p style={{ margin: '4px 0 0', color: '#333', whiteSpace: 'pre-line' }}>{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.some(e => e.degree || e.school) && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5B5BD6', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>
            Education
          </h2>
          {education.filter(e => e.degree || e.school).map(edu => (
            <div key={edu.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 700, margin: 0 }}>{edu.degree}</p>
                  <p style={{ color: '#555', margin: 0 }}>{edu.school}{edu.location ? ` · ${edu.location}` : ''}</p>
                </div>
                <p style={{ color: '#777', fontSize: '12px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {edu.startYear}{(edu.startYear || edu.endYear) ? ' – ' : ''}{edu.endYear}
                </p>
              </div>
              {edu.grade && <p style={{ color: '#555', margin: '2px 0 0', fontSize: '12px' }}>Grade: {edu.grade}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.filter(Boolean).length > 0 && (
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5B5BD6', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>
            Skills
          </h2>
          <p style={{ margin: 0, color: '#333' }}>{skills.filter(Boolean).join(' · ')}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Builder ──────────────────────────────────────────────────────────────

export function ResumeBuilderClient({ initialData, isLoggedIn }: Props) {
  const [data, setData] = useState<ResumeData>({
    personalInfo: {
      name:     initialData?.personalInfo?.name     ?? '',
      email:    initialData?.personalInfo?.email    ?? '',
      phone:    initialData?.personalInfo?.phone    ?? '',
      location: initialData?.personalInfo?.location ?? '',
      linkedin: initialData?.personalInfo?.linkedin ?? '',
    },
    summary:    initialData?.summary    ?? '',
    experience: initialData?.experience?.length ? initialData.experience : [emptyExp()],
    education:  initialData?.education?.length  ? initialData.education  : [emptyEdu()],
    skills:     initialData?.skills    ?? [''],
  });

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const hasContent = () => {
    const pi = data.personalInfo;
    return pi.name || pi.email || pi.phone || data.summary ||
      data.experience.some(e => e.jobTitle || e.company) ||
      data.education.some(e => e.degree || e.school) ||
      data.skills.some(Boolean);
  };

  const handleNewResume = () => {
    if (hasContent() && !confirm('Start a new resume? Your current data will be cleared.')) return;
    setData({
      personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '' },
      summary: '',
      experience: [emptyExp()],
      education: [emptyEdu()],
      skills: [''],
    });
    setSaved(false);
  };

  const updatePI = useCallback((field: keyof ResumeData['personalInfo'], value: string) => {
    setData(d => ({ ...d, personalInfo: { ...d.personalInfo, [field]: value } }));
  }, []);

  // ── Experience helpers ─────────────────────────────────────────────────────
  const updateExp = (id: string, field: keyof ExperienceEntry, value: string | boolean) => {
    setData(d => ({
      ...d,
      experience: d.experience.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };
  const addExp    = () => setData(d => ({ ...d, experience: [...d.experience, emptyExp()] }));
  const removeExp = (id: string) => setData(d => ({ ...d, experience: d.experience.filter(e => e.id !== id) }));

  // ── Education helpers ──────────────────────────────────────────────────────
  const updateEdu = (id: string, field: keyof EducationEntry, value: string) => {
    setData(d => ({
      ...d,
      education: d.education.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };
  const addEdu    = () => setData(d => ({ ...d, education: [...d.education, emptyEdu()] }));
  const removeEdu = (id: string) => setData(d => ({ ...d, education: d.education.filter(e => e.id !== id) }));

  // ── Skills helpers ─────────────────────────────────────────────────────────
  const updateSkill = (i: number, value: string) => {
    setData(d => { const s = [...d.skills]; s[i] = value; return { ...d, skills: s }; });
  };
  const addSkill    = () => setData(d => ({ ...d, skills: [...d.skills, ''] }));
  const removeSkill = (i: number) => setData(d => ({ ...d, skills: d.skills.filter((_, idx) => idx !== i) }));

  // ── Print / Download ───────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = document.getElementById('resume-preview');
    if (!content) return;
    const win = window.open('', '_blank', 'width=794,height=1123');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${data.personalInfo.name || 'Resume'}</title>
<style>
  body { margin: 0; padding: 32px; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.5; color: #111; }
  @page { size: A4; margin: 20mm; }
  @media print { body { padding: 0; } }
</style></head><body>`);
    win.document.write(content.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  };

  // ── Save to DB (logged-in users only) ─────────────────────────────────────
  const handleSave = async () => {
    if (!isLoggedIn) return;
    setSaving(true);
    try {
      await fetch('/api/resume-tools/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeBuilderData: data }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky toolbar */}
      <div className="sticky top-16 z-30 border-b border-border bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-semibold text-foreground sm:text-base">Resume Builder</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile tab toggle */}
            <div className="flex rounded-lg border border-border bg-secondary p-0.5 lg:hidden">
              {(['edit', 'preview'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${activeTab === tab ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={handleNewResume}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <FilePlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Resume</span>
            </button>
            {isLoggedIn && (
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Save className="h-3.5 w-3.5" />}
                {saved ? 'Saved!' : 'Save'}
              </button>
            )}
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main layout: Editor | Preview */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6 lg:flex-row flex-col">

          {/* ── Left: Editor ── */}
          <div className={`flex-1 min-w-0 space-y-4 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>

            {/* Personal Info */}
            <Section title="Personal Information" icon={User}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([ ['name','Full Name','e.g. Rahul Sharma'], ['email','Email','e.g. rahul@gmail.com'],
                    ['phone','Phone','e.g. +91 98765 43210'], ['location','Location','e.g. Mumbai, India'],
                    ['linkedin','LinkedIn / Website','e.g. linkedin.com/in/rahul'],
                ] as [keyof ResumeData['personalInfo'], string, string][]).map(([field, label, placeholder]) => (
                  <div key={field} className={field === 'linkedin' ? 'sm:col-span-2' : ''}>
                    <label className={labelCls}>{label}</label>
                    <input className={inputCls} placeholder={placeholder}
                      value={data.personalInfo[field]}
                      onChange={e => updatePI(field, e.target.value)} />
                  </div>
                ))}
              </div>
            </Section>

            {/* Summary */}
            <Section title="Professional Summary" icon={FileText}>
              <label className={labelCls}>Write 2–4 sentences about your experience and goals</label>
              <textarea className={`${inputCls} resize-none`} rows={4}
                placeholder="e.g. Motivated sales professional with 3+ years of experience driving revenue growth..."
                value={data.summary}
                onChange={e => setData(d => ({ ...d, summary: e.target.value }))} />
            </Section>

            {/* Work Experience */}
            <Section title="Work Experience" icon={Briefcase}>
              {data.experience.map((exp, idx) => (
                <div key={exp.id} className="mb-5 rounded-lg border border-border p-4 last:mb-0">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Experience {idx + 1}</span>
                    {data.experience.length > 1 && (
                      <button onClick={() => removeExp(exp.id)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Job Title</label>
                      <input className={inputCls} placeholder="e.g. Sales Executive"
                        value={exp.jobTitle} onChange={e => updateExp(exp.id, 'jobTitle', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Company</label>
                      <input className={inputCls} placeholder="e.g. Reliance Industries"
                        value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Location</label>
                      <input className={inputCls} placeholder="e.g. Mumbai"
                        value={exp.location} onChange={e => updateExp(exp.id, 'location', e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className={labelCls}>Start Date</label>
                        <input className={inputCls} placeholder="e.g. Jan 2022"
                          value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} />
                      </div>
                      <div className="flex-1">
                        <label className={labelCls}>End Date</label>
                        <input className={inputCls} placeholder="e.g. Dec 2023" disabled={exp.current}
                          value={exp.current ? 'Present' : exp.endDate}
                          onChange={e => updateExp(exp.id, 'endDate', e.target.value)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <input type="checkbox" id={`current-${exp.id}`} checked={exp.current}
                        onChange={e => updateExp(exp.id, 'current', e.target.checked)}
                        className="h-4 w-4 accent-primary" />
                      <label htmlFor={`current-${exp.id}`} className="text-sm text-foreground cursor-pointer">
                        I currently work here
                      </label>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Description (responsibilities & achievements)</label>
                      <textarea className={`${inputCls} resize-none`} rows={3}
                        placeholder="e.g. Managed a team of 5 and exceeded sales targets by 20%..."
                        value={exp.description} onChange={e => updateExp(exp.id, 'description', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addExp}
                className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <Plus className="h-4 w-4" /> Add Experience
              </button>
            </Section>

            {/* Education */}
            <Section title="Education" icon={GraduationCap}>
              {data.education.map((edu, idx) => (
                <div key={edu.id} className="mb-5 rounded-lg border border-border p-4 last:mb-0">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Education {idx + 1}</span>
                    {data.education.length > 1 && (
                      <button onClick={() => removeEdu(edu.id)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Degree / Course</label>
                      <input className={inputCls} placeholder="e.g. B.Com, MBA, 12th Pass"
                        value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>School / College</label>
                      <input className={inputCls} placeholder="e.g. Mumbai University"
                        value={edu.school} onChange={e => updateEdu(edu.id, 'school', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Location</label>
                      <input className={inputCls} placeholder="e.g. Mumbai"
                        value={edu.location} onChange={e => updateEdu(edu.id, 'location', e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className={labelCls}>Start Year</label>
                        <input className={inputCls} placeholder="e.g. 2019"
                          value={edu.startYear} onChange={e => updateEdu(edu.id, 'startYear', e.target.value)} />
                      </div>
                      <div className="flex-1">
                        <label className={labelCls}>End Year</label>
                        <input className={inputCls} placeholder="e.g. 2022"
                          value={edu.endYear} onChange={e => updateEdu(edu.id, 'endYear', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Grade / Percentage (optional)</label>
                      <input className={inputCls} placeholder="e.g. 7.8 CGPA or 75%"
                        value={edu.grade} onChange={e => updateEdu(edu.id, 'grade', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addEdu}
                className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <Plus className="h-4 w-4" /> Add Education
              </button>
            </Section>

            {/* Skills */}
            <Section title="Skills" icon={Star}>
              <p className={labelCls}>Add skills one by one (e.g. MS Excel, Communication, Tally)</p>
              <div className="space-y-2">
                {data.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className={inputCls} placeholder={`Skill ${i + 1}`}
                      value={skill} onChange={e => updateSkill(i, e.target.value)} />
                    {data.skills.length > 1 && (
                      <button onClick={() => removeSkill(i)}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addSkill}
                className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <Plus className="h-4 w-4" /> Add Skill
              </button>
            </Section>

          </div>

          {/* ── Right: Preview ── */}
          <div className={`w-full lg:w-[420px] xl:w-[480px] shrink-0 ${activeTab === 'edit' ? 'hidden lg:block' : ''}`}>
            <div className="sticky top-28">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
                <button onClick={handlePrint}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  <Download className="h-3 w-3" /> Download PDF
                </button>
              </div>
              {/* A4 preview */}
              <div className="overflow-hidden rounded-xl border border-border shadow-md">
                <div className="bg-white p-8 text-sm" style={{ minHeight: '500px' }}>
                  <ResumePreview data={data} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
