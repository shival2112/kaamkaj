import { Users, Building2, Briefcase } from 'lucide-react';

const STATS = [
  { value: '5 Cr+', label: 'Registered Candidates', icon: Users },
  { value: '10 L+', label: 'Employers Hiring', icon: Building2 },
  { value: '50 L+', label: 'Jobs Posted', icon: Briefcase },
] as const;

export function StatsBar() {
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 divide-x divide-border">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 py-6 sm:flex-row sm:justify-center sm:gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-lg font-bold text-foreground sm:text-2xl">{value}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
