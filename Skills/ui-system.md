# UI System Skill — KaamKaaj

## shadcn/ui Setup
- Config: `frontend/components.json`
- Style: `default` (HSL CSS variables)
- Components installed to: `frontend/components/ui/`
- Utils: `frontend/lib/utils.ts` (cn function)

## cn() Utility
```ts
import { cn } from '@/lib/utils';
// Merge conditional Tailwind classes safely
<div className={cn('base-class', isActive && 'active-class', className)} />
```

## Using shadcn Button
```tsx
import { Button } from '@/components/ui/button';

<Button>Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Danger</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button asChild><Link href="/jobs">Go to Jobs</Link></Button>
```

## Custom Primary Color Override
In `app/globals.css`, the `--primary` CSS variable is set to our brand color:
```css
:root {
  --primary: 240 60% 60%; /* #5B5BD6 */
  --primary-foreground: 0 0% 100%;
}
```

## Tailwind Custom Colors (from tailwind.config.ts)
```tsx
// Direct hex colors available via Tailwind:
className="bg-primary text-white"          // #5B5BD6
className="bg-secondary text-foreground"   // #F5F7FF
className="text-muted"                     // #6B7280
className="border-border"                  // #E5E7EB
className="text-success bg-success/10"     // #10B981
className="text-danger bg-danger/10"       // #EF4444
```

## Component Patterns

### Card Pattern
```tsx
// Job Card example
export function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-150">
      {/* content */}
    </div>
  );
}
```

### Badge Pattern
```tsx
const JOB_TYPE_STYLES = {
  'full-time': 'bg-green-50 text-green-700',
  'remote':    'bg-blue-50 text-blue-700',
  'part-time': 'bg-yellow-50 text-yellow-700',
  'contract':  'bg-purple-50 text-purple-700',
} as const;

<span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', JOB_TYPE_STYLES[jobType])}>
  {jobType}
</span>
```

### Loading Skeleton
```tsx
// Use for loading states — prevents layout shift
<div className="animate-pulse bg-border rounded-lg h-6 w-48" />
```

### Empty State
```tsx
export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
```

## Icons
Library: lucide-react
```tsx
import { Briefcase, MapPin, Search, Menu, X, ChevronDown } from 'lucide-react';
<Briefcase className="h-5 w-5 text-primary" />
```

## Responsive Containers
```tsx
// Standard page container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Narrow content (forms, auth)
<div className="max-w-md mx-auto px-4">

// Section padding
<section className="py-12 md:py-20">
```

## Installed shadcn Components (add as needed)
- button ✓ (Phase 1)
- input (Phase 2 - search)
- badge (Phase 2 - job type)
- card (Phase 2 - job cards)
- dropdown-menu (Navbar user menu)
- dialog (Modals)
- form (Auth forms)
- select (Filters)
- textarea (Cover letter)
- avatar (User avatar)
- separator (Dividers)
- sheet (Mobile sidebar)
- tabs (Dashboard tabs)
- table (Admin tables)
- skeleton (Loading states)
