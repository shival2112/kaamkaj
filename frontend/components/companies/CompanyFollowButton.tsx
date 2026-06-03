'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';

interface Props {
  companyId: string;
}

export function CompanyFollowButton({ companyId }: Props) {
  const [following, setFollowing] = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/candidate/follows')
      .then(r => r.ok ? r.json() : null)
      .then((d: { follows?: { id: string }[] } | null) => {
        if (d?.follows) setFollowing(d.follows.some(f => f.id === companyId));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (following) {
        await fetch(`/api/candidate/follows?companyId=${companyId}`, { method: 'DELETE' });
        setFollowing(false);
      } else {
        await fetch('/api/candidate/follows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId }),
        });
        setFollowing(true);
      }
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
        following
          ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
          : 'border-border bg-white text-muted-foreground hover:border-primary hover:text-primary'
      }`}
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : following
          ? <><BellOff className="h-4 w-4" /> Following</>
          : <><Bell className="h-4 w-4" /> Follow</>
      }
    </button>
  );
}
