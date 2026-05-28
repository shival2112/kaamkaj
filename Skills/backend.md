# Backend Skill — KaamKaaj

## Architecture
All backend logic lives in `frontend/app/api/**` as Next.js API Routes (serverless).
No separate Express/NestJS backend. No Docker.

## API Route Template
```ts
// frontend/app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const createJobSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  location: z.string(),
  jobType: z.enum(['full-time', 'part-time', 'remote', 'contract']),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';
    const location = searchParams.get('location') ?? '';

    const jobs = await prisma.job.findMany({
      where: {
        status: 'active',
        AND: [
          q ? { title: { contains: q, mode: 'insensitive' } } : {},
          location ? { location: { contains: location, mode: 'insensitive' } } : {},
        ],
      },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: jobs });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const job = await prisma.job.create({ data: { ...parsed.data, employerId: user.id } });
    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Rules for Every Route
1. Validate input with `zod`
2. Wrap in `try/catch`
3. Return `NextResponse.json(...)` with correct HTTP status
4. Check auth for protected routes (201, 401, 403, 404, 500)
5. Never expose raw error messages to clients

## HTTP Status Codes
- 200: OK (GET success)
- 201: Created (POST success)
- 400: Bad Request (validation failed)
- 401: Unauthorized (not logged in)
- 403: Forbidden (wrong role)
- 404: Not Found
- 500: Internal Server Error

## Search Pattern (ILIKE)
```ts
// Prisma ILIKE equivalent:
{ title: { contains: query, mode: 'insensitive' } }

// Multiple fields:
{
  OR: [
    { title: { contains: q, mode: 'insensitive' } },
    { description: { contains: q, mode: 'insensitive' } },
  ]
}
```

## Pagination Pattern
```ts
const page = parseInt(searchParams.get('page') ?? '1');
const limit = 12;
const skip = (page - 1) * limit;

const [jobs, total] = await prisma.$transaction([
  prisma.job.findMany({ skip, take: limit, ...filters }),
  prisma.job.count({ where: filters.where }),
]);

return NextResponse.json({ data: jobs, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
```

## Auth in API Routes
```ts
import { createServerSupabaseClient } from '@/lib/supabase-server';

const supabase = await createServerSupabaseClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Get role from Prisma (not JWT claims — more reliable)
const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
if (dbUser?.role !== 'employer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```
