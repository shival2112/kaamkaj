'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Star, Loader2, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string | null;
  createdAt: string;
  candidateId: string;
  candidate: { name: string };
}

interface ReviewsResponse {
  reviews: Review[];
  averageRating: number | null;
  totalReviews: number;
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-green-600', 'bg-orange-500', 'bg-pink-500'];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + h * 31;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${s} star${s > 1 ? 's' : ''}`}
          className="p-0.5"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              s <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StaticStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export function CompanyReviewsSection({ companyId, companyName }: { companyId: string; companyName: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const userRole = ((user?.user_metadata?.role as string) ?? '').toUpperCase();
  const { data: nextSession } = useSession();
  const nextRole = (nextSession?.user?.role as string ?? '').toUpperCase();

  const currentUserId = user?.id ?? nextSession?.user?.id ?? null;
  const isLoggedInCandidate =
    (!!user && (userRole === 'CANDIDATE' || userRole === '')) ||
    (!!nextSession?.user && (nextRole === 'CANDIDATE' || nextRole === ''));
  const isLoggedInNonCandidate =
    (!!user && userRole && userRole !== 'CANDIDATE') ||
    (!!nextSession?.user && nextRole && nextRole !== 'CANDIDATE');

  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/companies/${companyId}/reviews`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ReviewsResponse | null) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  const myReview = data?.reviews.find((r) => r.candidateId === currentUserId) ?? null;

  const openForm = (prefill?: Review) => {
    setRating(prefill?.rating ?? 0);
    setTitle(prefill?.title ?? '');
    setBody(prefill?.body ?? '');
    setError('');
    setFormOpen(true);
  };

  const submit = async () => {
    if (!rating) { setError('Please select a star rating.'); return; }
    if (!title.trim()) { setError('Please add a short title.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/companies/${companyId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title: title.trim(), body: body.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setError(err.error ?? 'Something went wrong. Please try again.');
        return;
      }
      const refreshed = await fetch(`/api/companies/${companyId}/reviews`);
      if (refreshed.ok) setData(await refreshed.json());
      setFormOpen(false);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeReview = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/companies/${companyId}/reviews`, { method: 'DELETE' });
      const refreshed = await fetch(`/api/companies/${companyId}/reviews`);
      if (refreshed.ok) setData(await refreshed.json());
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-foreground">Candidate Reviews</h2>
          {data && data.totalReviews > 0 ? (
            <div className="mt-1 flex items-center gap-2">
              <StaticStars rating={Math.round(data.averageRating ?? 0)} />
              <span className="text-sm font-medium text-foreground">{data.averageRating}</span>
              <span className="text-xs text-muted-foreground">
                ({data.totalReviews} review{data.totalReviews === 1 ? '' : 's'})
              </span>
            </div>
          ) : (
            !loading && <p className="mt-1 text-xs text-muted-foreground">No reviews yet — be the first to share your experience.</p>
          )}
        </div>

        {!loading && !myReview && !formOpen && (
          <>
            {isLoggedInCandidate && (
              <button
                onClick={() => openForm()}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Write a review
              </button>
            )}
            {!isLoggedInCandidate && !isLoggedInNonCandidate && (
              <button
                onClick={() => router.push(`/login?redirect=/companies/${companyId}`)}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Login to write a review
              </button>
            )}
          </>
        )}
      </div>

      {/* Existing review — edit / delete */}
      {!loading && myReview && !formOpen && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2.5">
          <p className="text-xs text-muted-foreground">You reviewed {companyName}.</p>
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => openForm(myReview)}
              className="flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
            <button
              onClick={removeReview}
              disabled={deleting}
              className="flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-danger transition-colors hover:border-danger disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
            </button>
          </div>
        </div>
      )}

      {/* Review form */}
      {formOpen && (
        <div className="mt-4 space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Your rating</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience (e.g. Great place to grow)"
            maxLength={100}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share more detail about your interview or work experience (optional)"
            rows={4}
            maxLength={1000}
            className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => setFormOpen(false)}
              className="flex-1 rounded-lg border border-border bg-white py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Submit review
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {!loading && data && data.reviews.length > 0 && (
        <div className="mt-5 space-y-4">
          {data.reviews.map((r) => (
            <div key={r.id} className="flex gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(r.candidate.name)}`}
              >
                {initials(r.candidate.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{r.candidate.name}</p>
                  <StaticStars rating={r.rating} />
                  <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{r.title}</p>
                {r.body && <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
