# Dashboard Skill — KaamKaaj

## Dashboard Types
1. **Candidate** — `/dashboard/candidate` — view applications, saved jobs, resume, profile
2. **Employer** — `/dashboard/employer` — post jobs, manage listings, view applicants
3. **Admin** — `/dashboard/admin` — manage users, jobs, view stats

## Layout Pattern
All dashboards share the same shell layout:

```tsx
// app/(dashboard)/layout.tsx
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
```

## DashboardShell Component
```
Desktop:
┌──────────────────────────────────────────────┐
│           Navbar (from root layout)          │
├────────────┬─────────────────────────────────┤
│            │                                 │
│  Sidebar   │     Page Content                │
│  (240px)   │     (flex-1)                    │
│  sticky    │     p-6                         │
│            │                                 │
└────────────┴─────────────────────────────────┘

Mobile:
┌─────────────────────┐
│    Navbar (mobile)  │
│    Page Content     │
│    p-4              │
│                     │
│    [Bottom TabBar]  │ ← fixed bottom, h-16
└─────────────────────┘
```

## Sidebar Navigation Items

### Candidate Sidebar
- Overview (home icon)
- My Applications (briefcase)
- Saved Jobs (bookmark)
- My Resume (file-text)
- Profile Settings (user)

### Employer Sidebar
- Overview (home icon)
- Post a Job (plus-circle)
- My Jobs (briefcase)
- Applications (users)
- Company Profile (building)

### Admin Sidebar
- Overview (home icon)
- Users (users)
- Jobs (briefcase)
- Applications (clipboard)
- Settings (settings)

## Stat Card Component
```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;      // e.g. "+12% from last month"
  icon: LucideIcon;
  iconColor?: string;   // e.g. "text-primary"
}

export function StatCard({ title, value, change, icon: Icon, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className={cn('h-5 w-5', iconColor ?? 'text-muted-foreground')} />
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {change && <p className="mt-1 text-xs text-muted-foreground">{change}</p>}
    </div>
  );
}
```

## Stat Cards per Dashboard

### Candidate
- Total Applications | Saved Jobs | Profile Views | Interviews

### Employer
- Total Jobs Posted | Active Jobs | Total Applications | Hired This Month

### Admin
- Total Users | Total Jobs | Applications Today | Active Jobs

## Page Layout Pattern
```tsx
export default function CandidateDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard ... />
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent applications, etc. */}
      </div>
    </div>
  );
}
```

## Application Status Colors
```ts
const STATUS_STYLES = {
  applied:     { bg: 'bg-blue-50',   text: 'text-blue-700'   },
  reviewing:   { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  shortlisted: { bg: 'bg-purple-50', text: 'text-purple-700' },
  rejected:    { bg: 'bg-red-50',    text: 'text-red-700'    },
  hired:       { bg: 'bg-green-50',  text: 'text-green-700'  },
};
```
