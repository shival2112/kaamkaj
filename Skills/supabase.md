# Supabase Skill — KaamKaaj

## Project Details
- Project ID: czviwnbivyqlfprlctae
- Region: ap-northeast-1 (AWS)
- Pooler Host: aws-1-ap-northeast-1.pooler.supabase.com
- Port: 6543
- DB: postgres

## Connection String
```
postgresql://postgres.czviwnbivyqlfprlctae:psspl@211297#@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

## Environment Variables (.env.local)
```env
DATABASE_URL="postgresql://postgres.czviwnbivyqlfprlctae:psspl@211297#@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.czviwnbivyqlfprlctae:psspl@211297#@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://czviwnbivyqlfprlctae.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```
Note: `DATABASE_URL` uses pooler (port 6543) for Prisma. `DIRECT_URL` uses direct connection for migrations.

## Browser Supabase Client (lib/supabase.ts)
```ts
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## Server Supabase Client (lib/supabase-server.ts)
```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

## Packages Required
```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Prisma + Supabase Setup
```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Prisma Client (lib/prisma.ts)
```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Common Supabase Operations

### Get Current User (Server)
```ts
const { data: { user } } = await supabase.auth.getUser();
```

### File Upload (Storage)
```ts
const { data, error } = await supabase.storage
  .from('resumes')
  .upload(`${userId}/resume.pdf`, file, { upsert: true });

const { data: { publicUrl } } = supabase.storage
  .from('resumes')
  .getPublicUrl(`${userId}/resume.pdf`);
```

## Migrations
```bash
# Run migrations against direct connection
npx prisma db push        # dev (no migration files)
npx prisma migrate dev    # prod (creates migration files)
npx prisma studio         # visual DB browser
```

## Row Level Security (RLS)
Enable RLS on all tables in Supabase dashboard.
Policies should match Prisma-level auth checks for defense in depth.
Example policy: "Users can only read their own applications"
