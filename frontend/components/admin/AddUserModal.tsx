'use client';

import { useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  _count: { applications: number };
}

interface Props {
  onClose: () => void;
  onCreated: (user: UserRow) => void;
}

export function AddUserModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: '', email: '', role: 'CANDIDATE', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as UserRow & { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to create user');
        return;
      }
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
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Add New User</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Full Name
            </label>
            <input
              required
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Priya Sharma"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Email Address
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="priya@example.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Role</label>
            <select
              value={form.role}
              onChange={set('role')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              <option value="CANDIDATE">Candidate</option>
              <option value="EMPLOYER">Employer</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Temporary Password
            </label>
            <input
              required
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Min. 6 characters"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              User can change this after their first login.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
