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

---

## Phase 16: Missing Core Pages
- [x] `/companies` listing page — cards with search, industry/size filter sidebar, active job count, verified badge
- [x] `/companies/[id]` detail page — gradient hero, about section, open jobs list, overview sidebar
- [x] `GET /api/companies` route — list with search + filters + pagination
- [x] `GET /api/companies/[id]` route — single company with active jobs
- [x] `CompanyFilters` client component — industry + size radio filters
- [x] Loading skeletons for `/companies` and `/companies/[id]`
- [x] Error boundaries for `/companies`
- [x] "Companies" added to Navbar nav links
- [x] Password reset flow — `/forgot-password` page + Supabase `resetPasswordForEmail`
- [x] `/update-password` page — `supabase.auth.updateUser` after recovery link clicked
- [x] `ForgotPasswordForm` + `UpdatePasswordForm` client components with inline validation
- [x] `/auth/callback` updated to respect `?next=` param for recovery redirect
- [x] "Forgot password?" link wired in LoginForm (was "coming soon")
- [x] Public candidate profile page `/profile/[id]` — shareable URL, gradient hero, bio, skills, experience badge
- [x] `GET /api/profile/[id]` route — public-safe fields only (no email/phone)
- [x] `ShareProfileButton` — copy-to-clipboard with "Copied!" feedback
- [x] "View Public Profile" link added to candidate dashboard profile header

---

## Phase 17: Candidate Experience Improvements
- [x] Similar jobs section on `/jobs/[id]` — server-side query (same company, location, or skills), 4-card grid
- [x] `RecentlyViewedTracker` — localStorage writer, silently tracks job IDs on each job detail visit
- [x] `RecentlyViewedJobs` — client component, reads localStorage + batch API, horizontal scroll strip on dashboard
- [x] `GET /api/jobs/batch` — fetch multiple jobs by `?ids=` for recently viewed
- [x] Cover letter editor — inline expand in `ApplyButton`: textarea + Submit / Skip letter buttons
- [x] Apply route updated to accept and save `coverLetter` from request body
- [x] Application withdrawal — `DELETE /api/candidate/applications/[id]` (APPLIED/REVIEWING only)
- [x] Withdraw button on `/dashboard/applications` with optimistic removal
- [x] Job Alerts — `GET/POST/DELETE /api/candidate/alerts` (stored in `Resume.parsedData`)
- [x] `/dashboard/alerts` page — create/delete up to 5 keyword+location alerts
- [x] "Job Alerts" + "My Interviews" added to DashboardSidebar DEFAULT_NAV

---

## Phase 18: Employer & Admin Gaps
- [x] Employer company profile edit `/employer/profile` — real DB (GET/PATCH `/api/employer/company`), replaces Zustand-only store
- [x] Job expiry — non-blocking `updateMany` in `GET /api/jobs` auto-closes jobs where `expiresAt < now`
- [x] Admin bulk actions on Users page — checkboxes, select-all, bulk Suspend / Restore action bar
- [x] Admin bulk actions on Jobs page — checkboxes, select-all, bulk Close / Reopen action bar
- [x] Admin Audit Log `/dashboard/admin/activity` — timeline feed of recent user registrations, job posts, and applications
- [x] `GET /api/admin/activity` route — merges 3 DB queries, sorted by timestamp desc, limit 50
- [x] "Activity" link added to admin sidebar nav

---

## Phase 19: Real-time & Notifications
- [x] Supabase Realtime on employer notification bell — subscribes to `applications` INSERT; auto re-fetches + bumps live unread count without polling
- [x] Green "live" dot on bell when no unread messages (shows Realtime is connected)
- [x] Supabase Realtime on candidate dashboard — `RealtimeStatusListener` subscribes to `applications` UPDATE filtered by `candidate_id`
- [x] `ToastContainer` + `useToast` hook — auto-dismissing toast UI, no external library
- [x] Toast fires when employer changes candidate's application status (SHORTLISTED, REJECTED, etc.)
- [x] `interviewScheduled` email template — HTML email with date, time, mode, meeting link
- [x] `POST /api/employer/interviews` — schedules interview, sends candidate email via Ethereal (free dev SMTP), logs preview URL to console

---

## Phase 20: Quality & Portfolio Polish
- [x] `lib/formatters.ts` — shared `formatSalary`, `timeAgo`, `tileColor`, `TYPE_LABELS`, `TYPE_BADGE`
- [x] Vitest unit tests — 2 test files, 21 passing tests covering `cn()`, `formatSalary`, `tileColor`, `timeAgo`
- [x] `npm test` script added to package.json; `vitest.config.ts` configured with path aliases
- [x] PWA — `public/manifest.json` (name, icons, shortcuts, theme colour), `public/sw.js` (cache-first, skips API routes)
- [x] `ServiceWorkerRegistrar` — client component, registers SW on mount, logs scope to console
- [x] PWA metadata in root layout — `manifest`, `themeColor`, `appleWebApp`
- [x] `app/sitemap.ts` — dynamic, includes static pages + all active jobs + all companies (max 300 URLs)
- [x] `app/robots.ts` — allows public pages, disallows dashboard/employer/api/auth routes
- [x] Dark mode CSS vars — `.dark` selector in globals.css with inverted HSL palette
- [x] `DarkModeToggle` — Moon/Sun button, reads `prefers-color-scheme` on first load, persists to localStorage
- [x] Dark mode toggle wired into Navbar (desktop) with smooth `transition` on body
- [x] A11y — skip-to-content link in root layout (sr-only, visible on focus)
- [x] A11y — `<main id="main-content">` wraps page content for skip-link target

---

---

## Phase 21: Advanced Engagement & Analytics
- [x] Prisma schema — `viewCount` on Job, `employerNotes` + `rating` on Application, new `ApplicationStatusLog` model; `npx prisma db push` applied
- [x] Feature 1: Job View Counter — `POST /api/jobs/[id]/view` increments `viewCount`; `RecentlyViewedTracker` fires it on every job detail visit; view count shown in employer listings page
- [x] Feature 2: Employer Application Notes — `PATCH /api/employer/applications/[id]` accepts `{ notes }` to save private notes; `NotesEditor` popover on every application row (amber badge when note exists)
- [x] Feature 3: Application Status History — every `PATCH` status change creates an `ApplicationStatusLog` record; `GET /api/employer/applications/[id]/history` returns the full timeline
- [x] Feature 4: Admin CSV Export — `GET /api/admin/export?type=users|jobs|applications` streams a CSV; "Export CSV" download link added to admin Users and Jobs pages
- [x] Feature 5: Candidate Rating — `PATCH /api/employer/applications/[id]` accepts `{ rating: 1–5 }`; interactive star-rating widget on Shortlisted page, persists to DB; click same star to clear
- [x] Feature 6: Experience Level Filter — `GET /api/jobs` now accepts `?experienceLevel=FRESHER|JUNIOR|MID|SENIOR|LEAD`; validated against Prisma enum before applying
- [x] Feature 7: Experience Level filter in `/jobs` sidebar — `JobFilters.tsx` radio group; `jobs/page.tsx` passes param to Prisma where clause
- [x] Feature 8: Job share buttons — `JobShareButtons` client component (WhatsApp / LinkedIn / X / copy-link) in the `/jobs/[id]` sidebar card
- [x] Feature 9: Admin Data Exports fully surfaced — three one-click download links on Admin Reports page; individual Export CSV on Users + Jobs pages
- [x] Feature 10: Employer Analytics real data — page rewritten to fetch `GET /api/employer/analytics`; API updated with `viewCount`, shortlisted count, job status; KPI row + 14-day bar timeline with hover tooltips
- [x] Feature 11: View count in admin jobs table — VIEWS column added to header + every job row

---

## Phase 22: Discovery & Candidate Experience
- [x] F1: Trending sort — `GET /api/jobs` accepts `?sort=newest|trending|salary_desc|salary_asc`; sort tab pills on `/jobs` page; 🔥 Trending badge on job cards with ≥10 views
- [x] F2: Cover letter templates — 3 built-in templates (Enthusiastic / Experienced / Fresher) selectable in `ApplyButton` compose step; click to auto-fill textarea
- [x] F3: Application daily rate limit — `POST /api/jobs/[id]/apply` enforces 10 applications/24 h per candidate; returns 429 with retry-after hours; `ApplyButton` shows the error message
- [x] F4: Company follow — `GET/POST/DELETE /api/candidate/follows` (stored in `Resume.parsedData.followedCompanies`); `CompanyFollowButton` client component on `/companies/[id]` with optimistic toggle
- [x] F5: Admin user detail page — `/dashboard/admin/users/[id]`; shows profile, KPI strip (apps / saved / skills), resume link, recent applications; user names in list are now clickable links; `GET /api/admin/users/[id]` added
- [x] F6: Notification preferences — `GET/PATCH /api/candidate/notification-prefs` (stored in `parsedData.notifPrefs`); toggle switches on candidate profile page for status change / interview / new jobs emails; saves on every toggle

---

## Phase 23: Communications, Reviews & Smart Search
- [x] Schema — `rejectionReason String?` on Application; new `CompanyReview` model (one per candidate per company, 1–5 stars + title + body); new `JobTemplate` model; `npx prisma db push` applied + client regenerated
- [x] F1: Full-text search — `GET /api/jobs?q=` now searches `title OR description OR skills` (via Prisma `OR` with `hasSome`), not just title
- [x] F2: Job alerts delivery — `POST /api/candidate/alerts/trigger` (protected by `x-trigger-secret` header); matches all candidates' saved alerts against recent jobs; respects `notifPrefs.emailOnNewJobs=false`; sends digest emails via existing mailer; accepts `?hours=N` (default 24, max 168)
- [x] F3: Rejection reason — `PATCH /api/employer/applications/[id]` accepts `{ rejectionReason }` (set to null to clear); field returned in `GET /api/candidate/applications` automatically (no select override needed)
- [x] F4: Company reviews — `GET/POST/DELETE /api/companies/[id]/reviews`; one review per candidate per company (upsert); returns `averageRating` + `totalReviews`; candidates only; no phone-bridge emails accepted
- [x] F5: Job templates — `GET/POST /api/employer/templates` + `GET/PATCH/DELETE /api/employer/templates/[id]`; max 20 per employer; stores arbitrary job-form JSON payload; ownership verified on every write
- [x] F6: Skills gap API — `GET /api/jobs/[id]/skills-gap`; normalises skill strings before comparison; returns `{ matched, missing, pct, authenticated, totalRequired }`; unauthenticated callers get `{ authenticated: false }` gracefully
- [x] F7: Employer bulk message — `POST /api/employer/bulk-message`; filters applications by `status` (default `SHORTLISTED`); skips phone-bridge emails; wraps message in branded HTML; returns `{ sent, skipped, recipients, total }`

---

## Phase 24: Platform Completeness & Hardening
- [x] F1: Change password from profile — `PATCH /api/auth/password` calls Supabase `auth.updateUser({ password })`; wired into candidate `/dashboard/profile` and employer `/employer/profile` settings sections; current password confirmation required
- [x] F2: Job clone / repost — `POST /api/employer/jobs/[id]/clone` duplicates a job with status DRAFT and title prefixed "Copy of …"; button on employer listings page row; no schema change needed
- [x] F3: Interview feedback — `POST /api/employer/interviews/[id]/feedback` saves outcome (PASSED / FAILED / NO_SHOW), rating 1–5, and private notes into Meeting record; feedback page wired to real API (fire-and-forget alongside Zustand save); Prisma schema: `feedbackOutcome`, `feedbackRating`, `feedbackNotes` added + `npx prisma db push`
- [x] F4: Candidate application history export — `GET /api/candidate/applications/export` returns CSV; "Export CSV" button on `/dashboard/applications` page triggers client-side Blob download
- [x] F5: Abuse report on job listings — `POST /api/jobs/[id]/report` stores report in new `JobReport` model; admin jobs table shows red report count badge; Prisma schema: `JobReport` model + `npx prisma db push`
- [x] F6: Admin review moderation — `DELETE /api/admin/reviews/[id]` hard-deletes a `CompanyReview`; `/dashboard/admin/reviews` page lists all reviews with delete button; existing page updated to use RESTful endpoint
- [x] F7: Admin announcement banner — `GET/POST/PATCH /api/admin/announcements` wraps Site Settings; `AnnouncementBanner` converted to client component: fetches on mount, supports sessionStorage dismiss with X button
- [x] F8: Recruiter sub-accounts — `GET/POST/DELETE /api/employer/recruiters` fully implemented; `/employer/recruiters` page with add/remove modal; uses existing `recruiterCompanyId` relation on User
- [x] F9: Admin settings enforcement — `max_applications_per_day` read from DB in apply route via `getMaxApplicationsPerDay()`; `maintenance_mode` returns 503 in `GET /api/jobs` and `POST /api/jobs/[id]/apply`; admin settings page exposes both controls
- [x] F10: Stale job auto-close — `POST /api/admin/jobs/cleanup` closes ACTIVE jobs with no applications updated 90+ days ago; "Run Cleanup" button on admin Jobs page

---

## Phase 25: Recruiter Portal (Full Module) ✓
- [x] Schema: `InterviewEvaluation` model (5 scored criteria, recommendation enum, strengths/improvements/notes, sharedWithEmployer, FK → Meeting + evaluator)
- [x] Schema: `assignedRecruiterId` on Application; `npx prisma db push`
- [x] `lib/recruiter-auth.ts` — `resolveRecruiterContext()` returns `{ userId, companyId }`
- [x] `middleware.ts` — add RECRUITER role routing → `/recruiter/dashboard`
- [x] `GET /api/recruiter/dashboard` — KPIs (assigned apps, today's interviews, pass/fail/hired counts)
- [x] `GET /api/recruiter/jobs` — company jobs list
- [x] `POST /api/recruiter/jobs` — post new job under company
- [x] `GET /api/recruiter/applications` — all company applications, filter by status/job
- [x] `PATCH /api/recruiter/applications/[id]` — status update + hire confirmation email
- [x] `GET/POST /api/recruiter/interviews` — list/schedule interviews
- [x] `GET/POST /api/recruiter/interviews/[id]/evaluate` — get/submit evaluation; share email to employer
- [x] `RecruiterShell` component — sidebar nav + header layout
- [x] `/recruiter/dashboard` — KPI cards (assigned apps, today's interviews, pass rate)
- [x] `/recruiter/jobs` — company jobs + Post a Job button
- [x] `/recruiter/applications` — candidate table, status filter tabs, status update
- [x] `/recruiter/candidates/[id]` — candidate profile: skills, resume, application + interview history
- [x] `/recruiter/interviews` — upcoming + past interviews, schedule button
- [x] `/recruiter/interviews/[id]/evaluate` — Interview Evaluation Form (star scores, recommendation, share toggle)
- [x] `/recruiter/pipeline` — kanban: Applied → Reviewing → Shortlisted → Hired/Rejected

---

## Phase 26: Admin Jobs Deep Dive & UX Fixes ✓
- [x] F1: Admin jobs — stats strip (clickable Active/Closed/Draft/Expired/Reported pills → instant filter)
- [x] F2: Admin jobs — extra filters: Experience Level, Posted In (7/30/90 days), Urgent-only toggle, Has-Reports toggle
- [x] F3: Admin jobs — Reset Filters button (appears only when any filter is active)
- [x] F4: Admin jobs — page size selector (10/20/50/100 per page) in pagination bar
- [x] F5: Admin jobs — jump-to-page input (visible when >2 pages exist)
- [x] F6: Admin jobs — bulk permanent delete (confirm dialog; removes record from DB)
- [x] F7: Admin jobs — bulk Mark Urgent / Clear Urgent in bulk action bar
- [x] F8: Admin jobs — individual permanent delete in detail drawer danger zone
- [x] F9: Admin jobs — Conversion Rate (CVR %) sub-text under Apps column per row
- [x] F10: Admin jobs — `GET /api/admin/jobs` extended: pageSize, exp, days, urgent, reported params + stats in response
- [x] F11: Admin jobs — `DELETE /api/admin/jobs/[id]` handler added
- [x] F12: Withdraw with mandatory reason — modal replaces browser confirm(); textarea min 10 chars enforced on client + server (400 if missing); reason logged server-side
- [x] F13: SaveButton active state on jobs listing — `/jobs` server component fetches saved job IDs in parallel and passes `initialSaved` to each SaveButton; bookmark now shows filled for already-saved jobs

---

## Phase 27: Product Depth & Portfolio Polish ✓
- [x] F1: Interview countdown card — candidate dashboard shows days/hours until next scheduled interview
- [x] F2: Application timeline view — toggle on `/dashboard/applications` between table and vertical timeline (uses ApplicationStatusLog)
- [x] F3: Rejection reason display — candidate sees employer's rejectionReason in styled message instead of just "Rejected" chip
- [x] F4: Resume completeness score — circular gauge (0–100%) on candidate dashboard scoring name/bio/headline/skills/photo/experience
- [x] F5: Offer letter generator — `/employer/offer-letter` form (role, salary, start date) → styled HTML; copy + email candidate
- [x] F6: Duplicate application detector — badge in employer applications list when candidate applied to >1 company job
- [x] F7: Interview no-show tracker — "Mark No-show" button on meetings; surfaces warning badge on future applications from that candidate
- [x] F8: Admin dashboard live KPI refresh — setInterval 60s + "live" green dot indicator; stats no longer stale on reload
- [x] F9: Job quality score — computed score column in admin jobs table (salary/skills/desc/expiry checks)
- [x] F10: Flagged jobs review queue — `/dashboard/admin/flagged-jobs` dedicated triage page (jobs with ≥1 report, sorted by count)
- [x] F11: Email verification gate — `POST /api/jobs/[id]/apply` + `POST /api/employer/jobs` blocked if emailVerified=false; `POST /api/auth/resend-verification` added
- [x] F12: Referral tracking — `?ref=<userId>` on job URLs stored as `referredBy` on Application; admin top-referrers report; schema: `referredBy String?`
- [x] F13: Saved search history — last 5 searches in localStorage; quick-pick chips below search bar on `/jobs`
- [x] F14: Changelog page — `/changelog` static page listing features by date
- [x] F15: API rate limiting — in-memory counter on `/api/auth/signup`; 429 + Retry-After header

## Phase 28: Testing & Hardening (In Progress)
- [x] F6: E2E test suite — Playwright added (`frontend/playwright.config.ts`, `frontend/e2e/`); 4 specs run in sequence against `next dev`: employer signup + post job (via API), candidate signup + onboarding, candidate apply, employer reviews application and advances its stage; `npm run test:e2e` / `test:e2e:ui`
- [x] `frontend/e2e/db.ts` — direct Prisma helper to flip `emailVerified` after signup, since the shared dev Mailtrap relay is rate-limited and can't deliver real verification links in CI
- [x] `frontend/e2e/state.ts` — read-merge-write JSON fixture (`e2e/.tmp/run-state.json`, gitignored) passing candidate/employer/job IDs between specs that must run in order

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
