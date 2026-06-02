# KAAMKAJ - TODO Tracker

## Current Feature
**Phase 4: Jobs Module (Listing, Filters, Detail, Search)**

## Status Legend
- [x] Completed
- [ ] Pending
- [~] In Progress
- [!] Blocked

---

## Phase 1: Foundation ✓
- [x] CLAUDE.md, TODO.md, ARCHITECTURE.md, DESIGN.md
- [x] Skills/ — all 9 skill files
- [x] Next.js 14.2.35 + TypeScript + Tailwind + App Router
- [x] Tailwind design tokens, shadcn/ui, Button component
- [x] Root layout with Inter font + ConditionalNavbar
- [x] globals.css with CSS variables

---

## Phase 2: Homepage ✓
- [x] Rebuilt marketing homepage — Hero (gradient), SearchBar, StatsBar, CategoryGrid, Footer
- [x] `/login` and `/signup` clean URL pages (canonical routes)
- [x] Navbar — Find Jobs, Companies, For Employers, About + Login / Sign Up / Post a Job
- [x] Reusable UI components: JobCard (ui/), StatusChip, KPICard, SearchBar (ui/), SidebarNav
- [x] HeroSearch client wrapper for server-side homepage

---

## Phase 3: Authentication ✓
- [x] Prisma 5.22 schema — 6 models (User, Company, Job, Application, SavedJob, Resume) + 5 enums
- [x] Supabase Auth (browser + server SSR clients)
- [x] LoginForm + SignupForm (email/password + Google OAuth, role selector)
- [x] Middleware — role-based routing, protects /dashboard/*, /employer/*, /dashboard/admin
- [x] Zustand auth store + useAuth hook
- [x] /auth/callback (OAuth + email confirm), /api/auth/signup, /api/users/[id]
- [x] Navbar auth-aware (avatar + dropdown when logged in)
- [x] Clean URL routing: /login → /dashboard, /signup → role dashboard
- [x] Test users created: candidate@kaamkaaj.com, employer@kaamkaaj.com, admin@gmail.com

---

## Phase 4: Jobs Module ✓
- [x] Seed jobs table — 15 jobs across 3 companies (prisma/seed.ts, run: npm run db:seed)
- [x] `/jobs` listing page — job cards grid, filter sidebar (type, location, salary range)
- [x] `/jobs/[id]` detail page — full job description, company info, Apply button
- [x] `GET /api/jobs` route — list with filters (type, location, salary, search query, pagination)
- [x] `GET /api/jobs/[id]` route — single job detail
- [x] `POST /api/jobs/[id]/apply` route — candidate applies (creates Application record)
- [x] Pagination component (page numbers + prev/next)
- [x] SearchBar on /jobs connected to query params

---

## Phase 5: Candidate Dashboard (real data) ✓
- [x] Dashboard shell — sidebar, top bar, KPI cards, profile completion banner
- [x] KPIs wired to real API — applications count, saved jobs, shortlisted count
- [x] Recent Applications table — real DB data via /api/candidate/applications
- [x] Applied Jobs page `/dashboard/applications` — real applications from DB
- [x] Saved Jobs page `/dashboard/saved` — real saved jobs from DB
- [x] Save/unsave job from JobCard (toggle + API) — SaveButton on listing + detail
- [x] Resume upload page `/dashboard/resume` — Supabase Storage upload + DB record
- [x] Profile management page `/dashboard/profile` — edit name, phone (GET + PATCH)

---

## Phase 6: Employer Dashboard (real data) ✓
- [x] Dashboard shell + KPI cards wired to real API (stats: active listings, applicants, shortlisted, filled)
- [x] Post a Job form `/employer/dashboard/post-job` — full form, auto-creates company, POST /api/employer/jobs
- [x] My Listings page `/employer/dashboard/listings` — real jobs, pause/activate toggle
- [x] Applications Received `/employer/dashboard/applications` — real applicants, filter by job
- [x] Update application status (Review → Shortlist → Hire / Reject) — PATCH /api/employer/applications/[id]
- [x] Analytics page `/employer/dashboard/analytics` — CSS bar charts: status breakdown, 14-day timeline, top jobs

---

## Phase 7: Admin Dashboard (real data) ✓
- [x] Overview wired to real API — KPIs (total users, jobs, applications, new today), recent users + jobs tables
- [x] Users page `/dashboard/admin/users` — real DB users, search, paginated, suspend/restore toggle
- [x] Jobs page `/dashboard/admin/jobs` — real DB jobs, search, paginated, remove/reopen actions
- [x] Platform stats real counts via `/api/admin/stats`
- [x] Reports page `/dashboard/admin/reports` — live platform summary table + metric cards

---

## Phase 8: AI Demo Features ✓
- [x] Resume analyzer endpoint — POST /api/candidate/resume/analyze (keyword intersection scoring)
- [x] Job match score component (% match badge on JobCard for logged-in candidates with saved skills)
- [x] Skills management — PATCH /api/candidate/resume updates parsedData.skills; UI on /dashboard/resume

---

## Phase 9: Polish & Deploy ✓
- [x] Loading skeleton components — Skeleton base, JobCardSkeleton, TableRowSkeleton; loading.tsx for /jobs and /jobs/[id]
- [x] Error boundary components — error.tsx for root, /jobs, /jobs/[id] (Try again + Go home)
- [x] SEO metadata — OG + Twitter tags on /, /jobs; enhanced generateMetadata on /jobs/[id]
- [x] Vercel deployment configuration — vercel.json + .env.example with all required vars
- [x] Final build verification — 0 TS errors, 0 lint errors, 28 pages ✓

---

## Completed Phases
- [x] **Phase 1** — Foundation, docs, Next.js setup. Build ✓
- [x] **Phase 2** — Marketing homepage rebuilt, reusable UI components, clean URL routing. Build ✓
- [x] **Phase 3** — Full auth (Supabase + Prisma), middleware, role-based routing, all 3 dashboard shells. Build ✓
- [x] **Phase 4** — Jobs module: seed data, listing page, detail page, apply/save, filters, pagination. Build ✓
- [x] **Phase 5** — Candidate dashboard: KPIs, applications, saved jobs, resume upload, profile edit. Build ✓
- [x] **Phase 6** — Employer dashboard: post job, listings, applications, status updates, analytics. Build ✓
- [x] **Phase 7** — Admin dashboard: real KPIs, users (suspend/restore), jobs (remove/reopen), reports. Build ✓
- [x] **Phase 8** — AI demo: resume analyzer endpoint, job match score badges, skills management. Build ✓
- [x] **Phase 9** — Polish & deploy: skeletons, error boundaries, OG metadata, vercel.json, final build. Build ✓

---

---

## Phase 10: Job Prep / AI Mock Interview ✓
- [x] Data file `frontend/data/jobPrepData.ts` — 22 entries (Google x3, Zomato x3, Cisco x2 + 14 landing-page stubs)
- [x] `/job-prep` landing page — hero with carousel, company/role dropdowns, category pill tabs, 3 horizontally-scrollable sections
- [x] `/job-prep/[slug]` detail page — gradient header, round cards + questions, Practice buttons, sticky Share sidebar
- [x] ShareSidebar client component — WhatsApp/Facebook/LinkedIn/X share links + copy-link button
- [x] All 22 slugs pre-rendered as static HTML (SSG). Build ✓

---

---

## Phase 11: Contests Feature ✓
- [x] Data file `frontend/data/contestsData.ts` — 3 contests (2 live, 1 closed) with full typed schema
- [x] `/contests` listing page — 3-column layout: sticky filter sidebar, contest cards with countdown timers, About sidebar
- [x] `/contests/[slug]` detail page — gradient hero banner, 6-tab content section (Description, Eligibility, Rounds, Rewards, About Organizer, FAQ accordion)
- [x] Register Now button — opens Login Modal for unauthenticated users, shows "Registered ✓" on verify
- [x] Login Modal — phone number → Send OTP → 6-digit OTP → Verify & Register (mock flow)
- [x] Countdown timer component (HH:MM:SS, client-only to avoid hydration mismatch)
- [x] All 3 slugs pre-rendered as static HTML (SSG). Build ✓

---

## Phase 12: Degree Feature ✓
- [x] Data file `frontend/data/degreeData.ts` — 3 universities with full typed schema (courses, highlights, updates, placements, reviews)
- [x] `/degree` landing page — dark-purple hero, stats row, sticky filter bar (All/Masters/Bachelors), 3-col university cards grid
- [x] University cards — gradient banner, initials logo, NAAC/UGC/AICTE/NIRF badges, "Apna Advantage Assured" badge, Brochure + Apply Now CTA
- [x] `/degree/[slug]` detail page — full-width gradient hero, CSS-only marquee strip ("Apna Advantage Assured"), overlapping header card
- [x] Sticky tab nav (College Info | Courses | Fees | Admission | Placements | Reviews) with scroll-spy active-tab detection
- [x] All 6 tab sections rendered: About, stat cards, accreditations, updates carousel, highlights table, course cards, fees table, admission steps + eligibility, placements stats + recruiters, 3 review cards
- [x] Brochure modal — "not available in this demo version"
- [x] Login modal (reused from Contests) — phone → OTP → Verify; on success shows toast "Your interest has been noted"
- [x] 3 slugs statically pre-rendered (SSG). 0 TS errors. Build ✓
- [x] `globals.css` updated with `@keyframes marquee-scroll` + `.marquee-track` for pure-CSS infinite marquee

---

## Phase 13: Schedule Meeting CRUD ✓
- [x] `ScheduleInterviewModal` component — create/edit modal with validation (candidate, job, round, date, time, mode, interviewer, link)
- [x] `deleteInterview` action added to `employerStore`
- [x] `/employer/interviews` — Schedule button + Edit/Delete per row + status filter tabs
- [x] `/employer/candidates/[id]` — "Schedule Interview" button opens modal pre-filled with candidate
- [x] `/dashboard/admin/meetings` — Admin CRUD page: schedule/edit/cancel/delete meetings, search + filter tabs
- [x] `/dashboard/interviews` — Candidate view: upcoming interview cards + past interviews table
- [x] `ADMIN_NAV` updated in all 4 admin pages to include Meetings link
- [x] Candidate `DashboardSidebar` DEFAULT_NAV updated with "My Interviews" link

---

---

## Phase 15: Candidate Onboarding Profile ✓
- [x] `POST/GET /api/candidate/onboarding` — saves name, phone, headline, bio, location, skills, experienceLevel into Resume.parsedData; profileCompleted flag
- [x] `/dashboard/onboarding` — profile setup form (pre-fill on revisit, auto-skip if already complete)
- [x] `POST /api/jobs/[id]/apply` — blocks apply with PROFILE_INCOMPLETE (403) if profile not done
- [x] `ApplyButton` — redirects to `/dashboard/onboarding` on PROFILE_INCOMPLETE code
- [x] `SignupForm` + `AuthModal` — candidates redirected to `/dashboard/onboarding` instead of `/dashboard` after registration

---

## Phase 14: Employer Portal — Extended Features (In Progress)
- [x] Feature 1: Shortlisted Candidates page `/employer/shortlisted` — SHORTLISTED + HIRED view, Hire/Reject actions, API status filter
- [x] Feature 2: Hiring Pipeline (Kanban) `/employer/pipeline` — HTML5 DnD, 5 columns, optimistic update + rollback
- [x] Feature 3: CSV Export on Applications page — client-side Blob download, respects active jobId filter
- [x] Feature 4: Job Performance per Listing — totalApplicants + applicantsThisWeek on job cards (green "+N this week" badge)
- [x] Feature 5: Candidate Profile Drawer — click candidate name → slide-in panel with skills, resume link, all applications to your jobs
- [x] Feature 6: Notification Bell — live dropdown, unread badge, mark-read via localStorage, timeAgo labels
- [x] Feature 7: Inline Job status toggle — clickable Active/Closed badge on job title in Applications page, optimistic update + rollback

---

## Blockers
*(None currently)*

## Notes
- Repository: https://github.com/shival2112/kaamkaj
- Supabase project: czviwnbivyqlfprlctae (ap-northeast-1)
- Dashboard URLs: /dashboard (candidate) · /employer/dashboard · /dashboard/admin
- Test accounts:
  - candidate@kaamkaaj.com  →  Candidate@123#
  - employer@kaamkaaj.com   →  Employer@123#
  - admin@gmail.com         →  Admin@123#
