# KAAMKAJ - Architecture Documentation

## High-Level Architecture

```
User Browser
     │
     ▼
Next.js 14 App (Vercel Edge)
     ├── App Router Pages (SSR / SSG / ISR)
     │    ├── Server Components (default)
     │    └── Client Components (interactive UI only)
     ├── API Routes (Serverless Functions)
     │    └── Supabase SDK + Prisma ORM
     └── Middleware (JWT auth, role protection)
          │
          ▼
     Supabase (ap-northeast-1)
          ├── PostgreSQL database (via Prisma)
          ├── Auth (JWT, magic link, OAuth)
          └── Storage (resume files, company logos)
```

## Directory Structure

```
KaamKaaj/
├── CLAUDE.md                    # Claude Code guide
├── TODO.md                      # Task tracker
├── ARCHITECTURE.md              # This file
├── DESIGN.md                    # Design system
├── Skills/                      # Domain reference docs
│   ├── frontend.md
│   ├── backend.md
│   ├── ui-system.md
│   ├── supabase.md
│   ├── auth.md
│   ├── dashboard.md
│   ├── api-routes.md
│   ├── responsive-design.md
│   └── deployment.md
├── docs/                        # Extended docs / diagrams
└── frontend/                    # Next.js 14 Application
    ├── app/                     # App Router
    │   ├── (auth)/              # Route group: login, signup
    │   ├── (dashboard)/         # Route group: candidate, employer, admin
    │   ├── jobs/                # /jobs listing + /jobs/[id]
    │   ├── companies/           # /companies
    │   ├── api/                 # API routes (serverless)
    │   ├── layout.tsx           # Root layout (Navbar, fonts, metadata)
    │   ├── page.tsx             # Homepage
    │   ├── globals.css          # CSS variables + base styles
    │   ├── error.tsx            # Global error boundary
    │   └── not-found.tsx        # 404 page
    ├── components/
    │   ├── ui/                  # shadcn/ui components (auto-generated)
    │   ├── layout/              # Navbar, Footer, Sidebar
    │   ├── homepage/            # Hero, SearchBar, CategoryGrid, etc.
    │   ├── jobs/                # JobCard, JobList, JobFilters, JobDetail
    │   ├── auth/                # LoginForm, SignupForm, RoleSelector
    │   ├── dashboard/           # DashboardShell, StatCard, SidebarNav
    │   └── shared/              # Avatar, Badge, EmptyState, Spinner
    ├── hooks/                   # Custom React hooks
    │   ├── useAuth.ts
    │   ├── useJobs.ts
    │   └── useDebounce.ts
    ├── lib/                     # Utilities and clients
    │   ├── utils.ts             # cn() utility
    │   ├── supabase.ts          # Browser Supabase client
    │   ├── supabase-server.ts   # Server Supabase client
    │   └── prisma.ts            # Prisma client singleton
    ├── services/                # API call functions
    │   ├── jobService.ts
    │   ├── applicationService.ts
    │   └── userService.ts
    ├── store/                   # Zustand global state
    │   └── authStore.ts
    ├── styles/                  # (additional global styles if needed)
    ├── types/                   # TypeScript types
    │   ├── job.ts
    │   ├── user.ts
    │   └── application.ts
    ├── middleware.ts             # Auth + role middleware
    ├── prisma/
    │   └── schema.prisma        # Database schema
    ├── public/                  # Static assets
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

## API Routes Structure

```
frontend/app/api/
├── auth/
│   ├── login/route.ts           # POST
│   ├── signup/route.ts          # POST
│   └── logout/route.ts          # POST
├── jobs/
│   ├── route.ts                 # GET (list + search), POST (create)
│   └── [id]/route.ts            # GET, PUT, DELETE
├── applications/
│   ├── route.ts                 # GET, POST
│   └── [id]/route.ts            # GET, PUT (status update)
├── users/
│   └── [id]/route.ts            # GET, PUT
├── employer/
│   └── dashboard/route.ts       # GET analytics
├── candidate/
│   └── dashboard/route.ts       # GET summary
├── admin/
│   └── stats/route.ts           # GET platform stats
└── ai/
    ├── resume-analyze/route.ts  # POST
    └── match-score/route.ts     # POST
```

## Database Schema

### users
| Column       | Type      | Notes                         |
|--------------|-----------|-------------------------------|
| id           | uuid PK   | Supabase Auth user ID         |
| email        | text      | unique                        |
| name         | text      |                               |
| role         | enum      | candidate / employer / admin  |
| avatar_url   | text      | nullable                      |
| phone        | text      | nullable                      |
| created_at   | timestamp |                               |

### companies
| Column       | Type      |
|--------------|-----------|
| id           | uuid PK   |
| name         | text      |
| logo_url     | text      |
| description  | text      |
| website      | text      |
| industry     | text      |
| size         | text      |
| employer_id  | uuid FK → users.id |

### jobs
| Column       | Type      | Notes                                           |
|--------------|-----------|-------------------------------------------------|
| id           | uuid PK   |                                                 |
| title        | text      |                                                 |
| description  | text      |                                                 |
| company_id   | uuid FK   |                                                 |
| employer_id  | uuid FK   |                                                 |
| location     | text      |                                                 |
| salary_min   | int       | nullable                                        |
| salary_max   | int       | nullable                                        |
| job_type     | enum      | full-time / part-time / remote / contract       |
| skills       | text[]    |                                                 |
| status       | enum      | active / closed / draft                         |
| created_at   | timestamp |                                                 |

### applications
| Column       | Type      | Notes                                                |
|--------------|-----------|------------------------------------------------------|
| id           | uuid PK   |                                                      |
| job_id       | uuid FK   |                                                      |
| candidate_id | uuid FK   |                                                      |
| status       | enum      | applied / reviewing / shortlisted / rejected / hired |
| resume_url   | text      |                                                      |
| cover_letter | text      | nullable                                             |
| applied_at   | timestamp |                                                      |

### saved_jobs
| Column   | Type      |
|----------|-----------|
| id       | uuid PK   |
| job_id   | uuid FK   |
| user_id  | uuid FK   |
| saved_at | timestamp |

### resumes
| Column        | Type      |
|---------------|-----------|
| id            | uuid PK   |
| user_id       | uuid FK unique |
| file_url      | text      |
| parsed_skills | text[]    |
| uploaded_at   | timestamp |

## Authentication Flow
1. User submits credentials on `/login` or `/signup`
2. Supabase Auth validates, returns JWT
3. JWT stored in httpOnly cookie via server action
4. `middleware.ts` validates JWT on every protected route request
5. Role extracted from JWT claims → redirect if unauthorized

## Route Protection Matrix
| Route Pattern         | Roles Allowed              |
|-----------------------|----------------------------|
| /dashboard/candidate  | candidate                  |
| /dashboard/employer   | employer                   |
| /dashboard/admin      | admin                      |
| /jobs, /companies     | all (public)               |
| /login, /signup       | unauthenticated only        |

## Key Architecture Decisions
- **App Router over Pages Router**: streaming, nested layouts, server components
- **Supabase + Prisma**: Supabase for auth/storage, Prisma for type-safe DB queries
- **shadcn/ui**: headless, fully Tailwind-customizable, copy-paste components
- **Zustand**: minimal state management (auth state only; data via server components)
- **No separate backend**: API routes as serverless functions, no Express/NestJS
