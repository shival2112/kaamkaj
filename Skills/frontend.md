# Frontend Skill — KaamKaaj

## Tech Stack
- Next.js 14 App Router (TypeScript)
- Tailwind CSS + shadcn/ui
- Zustand (global auth state only)
- lucide-react icons

## Component Architecture

### Server vs Client Components
- Default: Server Component (no `'use client'`)
- Use `'use client'` only for: useState, useEffect, event handlers, browser APIs, Zustand

### Component Locations
```
components/
├── ui/            # shadcn auto-generated — do not manually edit
├── layout/        # Navbar, Footer, Sidebar, DashboardShell
├── homepage/      # Hero, SearchBar, CategoryGrid, JobsPreview, CompanyStrip
├── jobs/          # JobCard, JobList, JobFilters, JobDetailHeader
├── auth/          # LoginForm, SignupForm, RoleSelector
├── dashboard/     # StatCard, SidebarNav, DashboardHeader
└── shared/        # Avatar, Badge, EmptyState, LoadingSpinner, Skeleton
```

### Reusable Component Pattern
```tsx
// Always type props with interface, never inline objects
interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'remote' | 'contract';
  salary?: string;
}

export function JobCard({ id, title, company, location, jobType, salary }: JobCardProps) {
  // ...
}
```

## Import Alias
All imports use `@/` alias (maps to `frontend/`):
```ts
import { cn } from '@/lib/utils';
import { JobCard } from '@/components/jobs/JobCard';
import type { Job } from '@/types/job';
```

## Data Fetching Patterns

### Server Component (preferred for lists/detail pages)
```tsx
// app/jobs/page.tsx
export default async function JobsPage() {
  const jobs = await prisma.job.findMany({ where: { status: 'active' } });
  return <JobList jobs={jobs} />;
}
```

### Client Component with fetch
```tsx
'use client';
import { useState, useEffect } from 'react';
// Use only when data must be fetched client-side (search, real-time)
```

## Forms
Use uncontrolled forms with `FormData` in Server Actions, or controlled components with `react-hook-form` + `zod` for complex forms.

## Image Optimization
Always use `next/image` for user-uploaded content or logos.
Use standard `<img>` only for static SVGs/icons.

## Font
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

## State Management Rules
- Auth state → Zustand `authStore`
- UI state (modal open, filter values) → local `useState`
- Server data → server components or React Query (if added later)
- Do NOT put server data in Zustand

## TypeScript Rules
- No `any` — use `unknown` + type guards if needed
- Type all API responses explicitly
- Use `type` for shape/union definitions, `interface` for component props
