'use client';

import { useEffect, useState } from 'react';
import { Settings, Loader2, Megaphone, Layout, Bell, ShieldAlert, Sliders } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface SiteSettings {
  announcement_active: string;
  announcement_text: string;
  announcement_color: string;
  hero_tagline: string;
  platform_notice: string;
  maintenance_mode: string;
  max_applications_per_day: string;
}

const DEFAULTS: SiteSettings = {
  announcement_active:       'false',
  announcement_text:         '',
  announcement_color:        'blue',
  hero_tagline:              '',
  platform_notice:           '',
  maintenance_mode:          'false',
  max_applications_per_day:  '10',
};

const COLOR_OPTIONS = [
  { value: 'blue',  label: 'Blue',  className: 'bg-blue-500' },
  { value: 'green', label: 'Green', className: 'bg-green-500' },
  { value: 'amber', label: 'Amber', className: 'bg-amber-500' },
  { value: 'red',   label: 'Red',   className: 'bg-red-500' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const { toasts, addToast, dismiss } = useToast();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((d: SiteSettings) => setSettings({ ...DEFAULTS, ...d }))
      .catch(() => setSettings(DEFAULTS))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof SiteSettings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setSettings(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json() as SiteSettings & { error?: string };
      if (!res.ok) {
        addToast({ title: data.error ?? 'Failed to save settings', variant: 'error' });
        return;
      }
      setSettings({ ...DEFAULTS, ...data });
      addToast({ title: 'Settings saved', variant: 'success' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-foreground">Site Settings</h1>
        </div>
        <div className="flex items-center gap-3">
            <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Announcement Banner */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Announcement Banner</h2>
            <span className="ml-auto text-xs text-muted-foreground">Shown at the top of every public page</span>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, announcement_active: prev.announcement_active === 'true' ? 'false' : 'true' }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${settings.announcement_active === 'true' ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${settings.announcement_active === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-medium text-foreground">
                {settings.announcement_active === 'true' ? 'Banner is visible on the site' : 'Banner is hidden'}
              </span>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Banner Text</label>
              <input value={settings.announcement_text} onChange={set('announcement_text')}
                placeholder="e.g. We're hiring! Check out new opportunities →"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Banner Color</label>
              <div className="flex items-center gap-3">
                {COLOR_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, announcement_color: opt.value }))}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-colors ${settings.announcement_color === opt.value ? 'border-foreground' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <span className={`h-3 w-3 rounded-full ${opt.className}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live preview */}
            {settings.announcement_text && (
              <div className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white ${
                settings.announcement_color === 'green' ? 'bg-green-500' :
                settings.announcement_color === 'amber' ? 'bg-amber-500' :
                settings.announcement_color === 'red'   ? 'bg-red-500'   : 'bg-blue-500'
              }`}>
                Preview: {settings.announcement_text}
              </div>
            )}
          </div>
        </div>

        {/* Homepage Settings */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
            <Layout className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Homepage</h2>
            <span className="ml-auto text-xs text-muted-foreground">Override default homepage text</span>
          </div>
          <div className="px-6 py-5">
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Hero Tagline Override</label>
            <input value={settings.hero_tagline} onChange={set('hero_tagline')}
              placeholder="Leave blank to use default: 'Find your dream job across India'"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            <p className="mt-1 text-[11px] text-muted-foreground">If set, replaces the subtitle text in the homepage hero section.</p>
          </div>
        </div>

        {/* Platform Notice */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Platform Notice</h2>
            <span className="ml-auto text-xs text-muted-foreground">Shown at the top of the Jobs listing page</span>
          </div>
          <div className="px-6 py-5">
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Notice Text</label>
            <textarea value={settings.platform_notice} onChange={set('platform_notice')} rows={2}
              placeholder="e.g. New jobs added daily. Set up job alerts to never miss an opportunity."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            <p className="mt-1 text-[11px] text-muted-foreground">Leave blank to hide the notice.</p>
          </div>
        </div>

        {/* Platform Controls */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
            <Sliders className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Platform Controls</h2>
          </div>
          <div className="space-y-5 px-6 py-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, maintenance_mode: prev.maintenance_mode === 'true' ? 'false' : 'true' }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${settings.maintenance_mode === 'true' ? 'bg-red-500' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${settings.maintenance_mode === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <div>
                <span className="text-sm font-medium text-foreground">
                  {settings.maintenance_mode === 'true' ? <span className="text-red-600">Maintenance Mode ON — all public API routes return 503</span> : 'Maintenance Mode (off)'}
                </span>
              </div>
              <ShieldAlert className={`ml-auto h-4 w-4 ${settings.maintenance_mode === 'true' ? 'text-red-500' : 'text-gray-300'}`} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Max Applications Per Day (per candidate)</label>
              <input
                type="number" min="1" max="100"
                value={settings.max_applications_per_day}
                onChange={set('max_applications_per_day')}
                className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Default: 10. Candidates exceeding this get a 429 response.</p>
            </div>
          </div>
        </div>

      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
