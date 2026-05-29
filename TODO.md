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

## Phase 4: Jobs Module ← START HERE
- [ ] Seed jobs table with sample data (10–15 jobs via Prisma/Supabase)
- [ ] `/jobs` listing page — job cards grid, filter sidebar (type, location, salary range)
- [ ] `/jobs/[id]` detail page — full job description, company info, Apply button
- [ ] `GET /api/jobs` route — list with filters (type, location, salary, search query, pagination)
- [ ] `GET /api/jobs/[id]` route — single job detail
- [ ] `POST /api/jobs/[id]/apply` route — candidate applies (creates Application record)
- [ ] Pagination component (page numbers + prev/next)
- [ ] SearchBar on /jobs connected to query params

---

## Phase 5: Candidate Dashboard (real data)
- [x] Dashboard shell — sidebar, top bar, KPI cards, profile completion banner
- [x] Recent Applications table (sample data)
- [ ] Wire KPIs to real API (count applications, profile views, saved jobs)
- [ ] Applied Jobs page `/dashboard/applications` — real applications from DB
- [ ] Saved Jobs page `/dashboard/saved` — real saved jobs from DB
- [ ] Save/unsave job from JobCard (toggle + API)
- [ ] Resume upload page `/dashboard/resume` — Supabase Storage upload
- [ ] Profile management page `/dashboard/profile` — edit name, phone, avatar

---

## Phase 6: Employer Dashboard (real data)
- [x] Dashboard shell — sidebar, top bar, KPI cards, listings table, applicants table
- [ ] Post a Job form `/employer/dashboard/post-job` — full form → POST /api/jobs
- [ ] My Listings page `/employer/dashboard/listings` — real jobs from DB, status toggle
- [ ] Applications Received `/employer/dashboard/applications` — real applicants per job
- [ ] Update application status (Shortlist, Interview, Offer, Reject)
- [ ] Analytics page `/employer/dashboard/analytics` — charts (applications over time, etc.)

---

## Phase 7: Admin Dashboard (real data)
- [x] Dashboard shell — sidebar, top bar, KPI cards, users table, jobs table
- [ ] Users page `/dashboard/admin/users` — real users from DB, suspend/restore
- [ ] Jobs page `/dashboard/admin/jobs` — real jobs, approve/remove
- [ ] Platform stats wired to real counts (total users, jobs, applications)
- [ ] Reports page `/dashboard/admin/reports` — basic platform summary

---

## Phase 8: AI Demo Features
- [ ] Resume analyzer endpoint (mock scoring — keywords match)
- [ ] Job match score component (% match shown on JobCard for logged-in candidate)

---

## Phase 9: Polish & Deploy
- [ ] Loading skeleton components (JobCard skeleton, table skeleton)
- [ ] Error boundary components
- [ ] SEO metadata for all public pages (/jobs, /jobs/[id], /)
- [ ] Vercel deployment configuration
- [ ] Environment variables setup on Vercel
- [ ] Final build verification (0 TS errors, 0 lint errors)

---

## Completed Phases
- [x] **Phase 1** — Foundation, docs, Next.js setup. Build ✓
- [x] **Phase 2** — Marketing homepage rebuilt, reusable UI components, clean URL routing. Build ✓
- [x] **Phase 3** — Full auth (Supabase + Prisma), middleware, role-based routing, all 3 dashboard shells. Build ✓

---

## Blockers
*(None currently)*

## Notes
- Repository: https://github.com/shival2112/kaamkaj
- Supabase project: czviwnbivyqlfprlctae (ap-northeast-1)
- Dashboard URLs: /dashboard (candidate) · /employer/dashboard · /dashboard/admin
- Test accounts: candidate@kaamkaaj.com · employer@kaamkaaj.com · admin@gmail.com (all pw = Role@123#)
