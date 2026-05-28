# API Routes Skill — KaamKaaj

## Route Structure
```
frontend/app/api/
├── auth/
│   ├── login/route.ts
│   ├── signup/route.ts
│   └── logout/route.ts
├── jobs/
│   ├── route.ts           GET /?q=&location=&type=  POST /
│   └── [id]/route.ts      GET /:id  PUT /:id  DELETE /:id
├── applications/
│   ├── route.ts           GET /?jobId=  POST /
│   └── [id]/route.ts      GET /:id  PUT /:id (status update)
├── users/
│   └── [id]/route.ts      GET /:id  PUT /:id
├── employer/
│   └── dashboard/route.ts GET / (analytics)
├── candidate/
│   └── dashboard/route.ts GET / (summary)
├── admin/
│   └── stats/route.ts     GET /
└── ai/
    ├── resume-analyze/route.ts  POST /
    └── match-score/route.ts     POST /
```

## Standard Response Format
```ts
// Success
{ data: T, meta?: { page, limit, total, pages } }

// Error
{ error: string | ZodFlattenedErrors }
```

## Route Template
```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const InputSchema = z.object({ /* ... */ });

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check (if protected)
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Parse + validate
    const body = await req.json();
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    // 3. DB operation
    const result = await prisma.model.create({ data: parsed.data });

    // 4. Return
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Dynamic Route Params
```ts
// app/api/jobs/[id]/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: job });
}
```

## Search Query Pattern
```ts
// GET /api/jobs?q=developer&location=bangalore&type=remote&page=1
const q = searchParams.get('q') ?? '';
const location = searchParams.get('location') ?? '';
const type = searchParams.get('type'); // validates enum later

const where: Prisma.JobWhereInput = {
  status: 'active',
  ...(q && { OR: [
    { title: { contains: q, mode: 'insensitive' } },
    { description: { contains: q, mode: 'insensitive' } },
  ]}),
  ...(location && { location: { contains: location, mode: 'insensitive' } }),
  ...(type && { jobType: type as JobType }),
};
```

## Service Functions (client-side)
```ts
// services/jobService.ts
export async function fetchJobs(params: JobSearchParams) {
  const url = new URL('/api/jobs', window.location.origin);
  if (params.q) url.searchParams.set('q', params.q);
  if (params.location) url.searchParams.set('location', params.location);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json() as Promise<{ data: Job[] }>;
}
```

## Rate Limiting (simple)
Not implemented currently. Add Vercel rate limiting via Edge Config if needed in future.

## CORS
Not needed — same-origin API routes in Next.js.

## Zod Schemas Location
Define schemas inline in route files for simple cases.
For complex shared schemas: `frontend/lib/validations/jobSchema.ts`
