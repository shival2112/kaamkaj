'use client';

import { useEffect, useState } from 'react';
import { X, Mail, Phone, MapPin, FileText, Download, Loader2, ExternalLink } from 'lucide-react';

interface CandidateDetail {
  id: string; name: string; email: string;
  phone: string | null; avatar: string | null;
  headline: string | null; bio: string | null;
  location: string | null; experienceLevel: string | null;
  skills: string[]; resumeUrl: string | null;
}

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

const EXP_LABELS: Record<string, string> = {
  FRESHER: 'Fresher (0–1 yr)', JUNIOR: 'Junior (1–3 yrs)',
  MID: 'Mid (3–6 yrs)', SENIOR: 'Senior (6–10 yrs)', LEAD: 'Lead (10+ yrs)',
};

interface Props {
  candidateId: string | null;
  /** base path used for both profile fetch and resume download, e.g. '/api/employer/candidates' */
  resumeApiBase: string;
  onClose: () => void;
}

export function CandidateProfileDrawer({ candidateId, resumeApiBase, onClose }: Props) {
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!candidateId) { setCandidate(null); return; }
    setLoading(true);
    fetch(`${resumeApiBase}/${candidateId}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: { candidate?: CandidateDetail } | CandidateDetail | null) => {
        // employer API returns the object directly; admin API might wrap it
        if (!d) { setCandidate(null); return; }
        const c = 'candidate' in d ? (d as { candidate: CandidateDetail }).candidate : d as CandidateDetail;
        setCandidate(c);
      })
      .finally(() => setLoading(false));
  }, [candidateId, resumeApiBase]);

  const handleDownload = async () => {
    if (!candidateId) return;
    setDownloading(true);
    try {
      const res = await fetch(`${resumeApiBase}/${candidateId}/resume`);
      const data = await res.json() as { downloadUrl?: string; error?: string };
      if (data.downloadUrl) {
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = 'resume.pdf';
        a.click();
      }
    } finally {
      setDownloading(false);
    }
  };

  if (!candidateId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Candidate Profile</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !candidate ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">Could not load candidate details.</p>
            </div>
          ) : (
            <div className="space-y-5 p-6">
              {/* Profile header */}
              <div className="flex items-start gap-4">
                {candidate.avatar ? (
                  <img src={candidate.avatar} alt={candidate.name}
                    className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary/20" />
                ) : (
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white ${tileColor(candidate.name)}`}>
                    {candidate.name[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-foreground">{candidate.name}</h3>
                  {candidate.headline && (
                    <p className="text-sm text-muted-foreground">{candidate.headline}</p>
                  )}
                  {candidate.experienceLevel && (
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {EXP_LABELS[candidate.experienceLevel] ?? candidate.experienceLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="rounded-lg border border-border bg-gray-50 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {candidate.phone}
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {candidate.location}
                  </div>
                )}
              </div>

              {/* Bio */}
              {candidate.bio && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</p>
                  <p className="text-sm text-foreground leading-relaxed">{candidate.bio}</p>
                </div>
              )}

              {/* Skills */}
              {candidate.skills.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map(s => (
                      <span key={s} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume</p>
                {candidate.resumeUrl ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-gray-50 px-4 py-3">
                      <FileText className="h-6 w-6 shrink-0 text-red-500" />
                      <span className="text-sm font-medium text-foreground">resume.pdf</span>
                    </div>
                    <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                    <button onClick={handleDownload} disabled={downloading}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
                      {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      Download
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No resume uploaded.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
