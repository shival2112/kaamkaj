# KAAMKAJ - Claude Code Guide

## Project Overview
KAAMKAJ is a modern job portal demo inspired by apna.co, built as a portfolio/learning project.
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Prisma ORM.

## Mandatory Pre-Work (Before Every Feature)
1. Read: CLAUDE.md → TODO.md → ARCHITECTURE.md → DESIGN.md
2. Read relevant files from Skills/
3. Continue ONLY from pending tasks in TODO.md
4. NEVER regenerate completed work

## Post-Feature Checklist
- Mark tasks complete in TODO.md
- Update ARCHITECTURE.md if structure changed
- Update DESIGN.md if design tokens changed

## Project Root: f:\KaamKaaj
```
KaamKaaj/
├── CLAUDE.md, TODO.md, ARCHITECTURE.md, DESIGN.md
├── Skills/              # Reference documentation per domain
├── frontend/            # Next.js 14 App (source of truth)
│   ├── app/             # App Router pages & API routes
│   ├── components/      # layout/, ui/ (shadcn), shared/, homepage/, jobs/, auth/, dashboard/
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # utils, supabase client, prisma
│   ├── services/        # API service functions
│   ├── store/           # Zustand state
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
└── docs/                # Extended documentation
```

## Key Technical Rules
- TypeScript strict mode — NO `any`
- Server Components by default; `'use client'` only when needed (state, effects, browser APIs)
- Mobile-first with Tailwind utility classes
- Reusable components over one-off solutions
- No comment explaining WHAT code does; only WHY (non-obvious constraints)

## Design Tokens (quick reference)
- Primary: `#5B5BD6` → CSS var `--primary`, Tailwind `text-primary`/`bg-primary`
- Secondary: `#F5F7FF`
- Text: `#111827`, Muted: `#6B7280`, Border: `#E5E7EB`
- Success: `#10B981`, Danger: `#EF4444`
→ Full details in DESIGN.md

## Database
- Supabase PostgreSQL + Prisma ORM
- Connection: `postgresql://postgres.czviwnbivyqlfprlctae:psspl@211297#@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres`
- Client: `frontend/lib/supabase.ts` (browser) + `frontend/lib/supabase-server.ts` (server)
- Prisma schema: `frontend/prisma/schema.prisma`

## Auth
- Supabase Auth (JWT in httpOnly cookies)
- Roles: `candidate` | `employer` | `admin`
- Route protection via `frontend/middleware.ts`

## NEVER USE
Redis, Docker, Typesense, ClickHouse, paid APIs, enterprise OAuth, separate Express/NestJS backend

## API Routes Pattern
Every route in `frontend/app/api/**` must: validate input → try/catch → typed response → correct HTTP status code

## Component Naming
- PascalCase for components: `JobCard.tsx`
- kebab-case for route directories: `app/jobs/[id]/page.tsx`
- camelCase for hooks: `useJobSearch.ts`
- camelCase for services: `jobService.ts`
