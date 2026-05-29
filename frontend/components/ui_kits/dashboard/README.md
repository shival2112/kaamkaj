# Kaamkaj — Dashboard UI Kit (Candidate)

Logged-in candidate dashboard: sidebar nav, KPI cards, profile completion nudge, applications table, and recommended jobs.

## Interactive demo
Open `index.html`. You can:
- click sidebar items to switch views (Dashboard, My Applications, Saved Jobs, etc.)
- hover application rows; click them to navigate (placeholder)
- read the gradient profile-completion banner with a real animated progress ring

State persists across reloads in `localStorage` under `kaamkaj.dash.view`.

## Components
| File | What it is |
| --- | --- |
| `Sidebar.jsx`        | Left rail with logo, user block, Quick Apply CTA, candidate nav, account nav |
| `TopBar.jsx`         | Search input + notification bell + locale + avatar |
| `StatCard.jsx`       | One KPI tile — label, big number, delta, tinted icon |
| `ProfileBanner.jsx`  | Gradient "complete your profile" nudge with SVG progress ring |
| `ApplicationList.jsx`| Table of applications, with stage badge + next step |
| `RecommendedJobs.jsx`| 3-up grid of compact job cards for the dashboard density |
| `data.js`            | Sample user, stats, applications, recommended jobs |
| `styles.css`         | All dashboard styles, prefixed `.d-*` |

The dashboard re-uses **`../web/Icons.jsx`** (loaded relative to `index.html`) so the two kits share the same icon set. Don't duplicate.

## Employer dashboard
Not currently built — the spec mentions an employer dashboard variant with different sidebar links (Post a Job / My Listings / Applications / Analytics). To extend, fork `Sidebar.jsx`, swap the nav arrays, and add a "Listings" panel.
