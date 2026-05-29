# Kaamkaj — Web UI Kit (Marketing Site)

The public-facing Kaamkaj site: navbar, hero, stats, category grid, job listings, job detail, company strip, gradient CTA, footer.

## Interactive demo
Open `index.html`. You can:
- type in the hero search box → routes to the search results view
- click any job card → opens the full job detail page
- click "Apply Now" on detail → the button flips to a green "Application sent" state
- click categories or "Back to jobs" → routes back to the homepage

State is persisted in `localStorage` under `kaamkaj.view` so reloads keep your spot.

## Components
| File | What it is |
| --- | --- |
| `Icons.jsx`       | Lucide-style icon set, registered as `window.Icon.*` (also reused by the dashboard kit) |
| `Navbar.jsx`      | Sticky top nav, white shadow, auth + Post-a-Job CTAs |
| `Hero.jsx`        | Gradient hero with dual-field search + popular pills |
| `StatsBar.jsx`    | 5 Cr / 10 L / 50 L / 500+ Indian-number stats strip |
| `CategoryGrid.jsx`| 8 category tiles with tinted icon tiles + job counts |
| `JobCard.jsx`     | The canonical job card with company logo, chips, save + apply |
| `JobList.jsx`     | Section that hosts a 3-up grid of `JobCard`s, with optional filter row |
| `CompanyStrip.jsx`| 8-tile horizontal employer logo strip |
| `CtaBanner.jsx`   | Gradient employer "Post a Job free" banner |
| `Footer.jsx`      | 5-column dark footer with socials |
| `JobDetail.jsx`   | Full job detail view with sticky sidebar + apply CTA |
| `data.js`         | Sample categories, jobs, stats, companies |
| `styles.css`      | All UI-kit styles, prefixed `.k-*` |

## Conventions
- Every component is a small `function ComponentName(props)` and pushes itself to `window` at the end via `Object.assign(window, { ... })`.
- No bundler. Babel transpiles in the browser; integrity hashes pinned.
- Colors, type, radii, shadows all sourced from `../../colors_and_type.css`.
- The kit is **visual recreation only** — no real API, no routing, no form validation. Make production code from your real Next.js components.
