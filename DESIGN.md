# KAAMKAJ - Design System

## Color Palette

| Token       | Hex       | HSL               | CSS Variable          | Usage                          |
|-------------|-----------|-------------------|-----------------------|--------------------------------|
| Primary     | #5B5BD6   | 240 60% 60%       | --primary             | CTAs, links, active states     |
| Secondary   | #F5F7FF   | 228 100% 98%      | --secondary           | Background tints, secondary bg |
| Text        | #111827   | 222 47% 11%       | --foreground          | Headings, body text            |
| Muted       | #6B7280   | 220 9% 46%        | --muted-foreground    | Secondary text, placeholders   |
| Border      | #E5E7EB   | 220 13% 91%       | --border              | Dividers, card borders         |
| Background  | #F9FAFB   | 220 14% 98%       | --background          | Page background                |
| Surface     | #FFFFFF   | 0 0% 100%         | --card                | Card and panel backgrounds     |
| Success     | #10B981   | 160 84% 39%       | (direct Tailwind)     | Status, success states         |
| Danger      | #EF4444   | 0 84% 60%         | --destructive         | Errors, destructive actions    |

### Tailwind Direct Classes (custom tokens in tailwind.config.ts)
```
text-primary     bg-primary     border-primary
text-muted       bg-secondary   border-border
text-success     bg-success
text-danger      bg-danger
```

---

## Typography

Font Family: **Inter** (Google Fonts, `next/font/google`)

| Scale  | Tailwind          | Size    | Weight | Line Height | Usage                     |
|--------|-------------------|---------|--------|-------------|---------------------------|
| h1     | text-4xl font-bold | 2.25rem | 700    | 1.2         | Hero headings             |
| h2     | text-3xl font-bold | 1.875rem| 700    | 1.25        | Section headings          |
| h3     | text-2xl font-semibold | 1.5rem | 600 | 1.3        | Card titles, sub-sections |
| h4     | text-xl font-semibold  | 1.25rem| 600 | 1.4        | Component headings        |
| body   | text-base         | 1rem    | 400    | 1.5         | Body text                 |
| sm     | text-sm           | 0.875rem| 400    | 1.5         | Meta, labels, captions    |
| xs     | text-xs           | 0.75rem | 400    | 1.5         | Tags, badges              |

---

## Spacing System (Tailwind)
Base unit: 4px  
Scale: p-1(4px) p-2(8px) p-3(12px) p-4(16px) p-5(20px) p-6(24px) p-8(32px) p-10(40px) p-12(48px) p-16(64px) p-20(80px) p-24(96px)

---

## Breakpoints

| Name   | Min Width | Tailwind Prefix | Primary Use           |
|--------|-----------|-----------------|-----------------------|
| Mobile | 0–639px   | (default)       | Single column layouts |
| sm     | 640px     | sm:             | Small tablets         |
| md     | 768px     | md:             | Tablet portrait       |
| lg     | 1024px    | lg:             | Desktop (primary)     |
| xl     | 1280px    | xl:             | Wide desktop          |
| 2xl    | 1536px    | 2xl:            | Ultra-wide            |

---

## Container
```
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

---

## Navbar

| Property        | Value                                  |
|-----------------|----------------------------------------|
| Height Desktop  | h-16 (64px)                            |
| Height Mobile   | h-14 (56px)                            |
| Position        | sticky top-0 z-50                      |
| Background      | bg-white                               |
| Border (resting)| border-b border-border                 |
| Shadow (scrolled)| shadow-md + transition                |
| Logo            | Briefcase icon + "KaamKaaj" in primary, text-xl font-bold |
| Nav links       | text-sm font-medium text-muted-foreground hover:text-primary |
| Login button    | variant="outline" (border-primary, text-primary) |
| Signup button   | variant="default" (bg-primary, text-white) |
| Mobile breakpoint | md: (768px) — below this shows hamburger |

---

## Card Styles

### Job Card
```
bg-white rounded-xl border border-border p-5 shadow-sm
hover:shadow-md hover:border-primary/30 transition-all duration-150 cursor-pointer
```

### Company Card
```
bg-white rounded-xl border border-border p-4 flex items-center gap-3
```

### Dashboard Stat Card
```
bg-white rounded-xl border border-border p-6
```

---

## Button Styles

| Variant   | Tailwind Classes                                              |
|-----------|---------------------------------------------------------------|
| Primary   | bg-primary text-white hover:bg-primary/90 px-6 py-2.5 rounded-lg font-medium transition |
| Outline   | border-2 border-primary text-primary hover:bg-secondary px-6 py-2.5 rounded-lg font-medium transition |
| Ghost     | text-muted-foreground hover:text-primary hover:bg-secondary px-4 py-2 rounded-md transition |
| Danger    | bg-danger text-white hover:bg-danger/90 px-6 py-2.5 rounded-lg transition |
| Link      | text-primary underline-offset-4 hover:underline              |

Button sizes: sm (px-4 py-1.5 text-sm) | default (px-6 py-2.5) | lg (px-8 py-3 text-lg)

---

## Badge / Tag Styles

| Type        | Classes                                                    |
|-------------|------------------------------------------------------------|
| Job type    | text-xs font-medium px-2.5 py-1 rounded-full               |
| Full-time   | bg-green-50 text-green-700                                 |
| Remote      | bg-blue-50 text-blue-700                                   |
| Part-time   | bg-yellow-50 text-yellow-700                               |
| Contract    | bg-purple-50 text-purple-700                               |
| Applied     | bg-primary/10 text-primary                                 |

---

## Form Elements

```
Input:    border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary w-full
Label:    text-sm font-medium text-foreground mb-1.5 block
Error:    text-xs text-danger mt-1
Helper:   text-xs text-muted-foreground mt-1
```

---

## Dashboard Layout

```
Desktop:
┌─────────────────────────────────────────────────┐
│  Navbar (sticky, full width)                    │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Main Content                        │
│ (240px)  │  (flex-1, overflow-y-auto)           │
│ fixed    │  p-6                                 │
└──────────┴──────────────────────────────────────┘

Mobile:
┌─────────────────┐
│ Navbar (mobile) │
├─────────────────┤
│ Main Content    │
│ p-4             │
└─────────────────┘
│ Bottom Nav Tab  │  ← 4 icon tabs, h-16, fixed bottom
└─────────────────┘
```

---

## Shadows

| Name     | Class      | Usage                    |
|----------|------------|--------------------------|
| Card     | shadow-sm  | Default card state       |
| Hover    | shadow-md  | Card hover state         |
| Sticky   | shadow-md  | Scrolled navbar          |
| Modal    | shadow-xl  | Dialogs, popovers        |

---

## Border Radius

| Scale  | Class       | Usage                    |
|--------|-------------|--------------------------|
| sm     | rounded-md  | Inputs, small elements   |
| md     | rounded-lg  | Buttons, cards           |
| lg     | rounded-xl  | Main cards               |
| full   | rounded-full| Avatars, pills, tags     |

---

## Transitions
All interactive elements: `transition-all duration-150 ease-in-out`  
Color transitions: `transition-colors duration-150`  
Shadow transitions: `transition-shadow duration-150`

---

## Iconography
Library: `lucide-react`  
Default size: `h-5 w-5` (20px)  
Nav icons: `h-5 w-5`  
Logo icon: `h-6 w-6`  
Inline icons: `h-4 w-4`  

---

## Responsive Behavior Summary

| Element       | Mobile                    | md (768px+)              |
|---------------|---------------------------|--------------------------|
| Navbar        | Hamburger menu            | Full links + buttons     |
| Hero heading  | text-3xl                  | text-5xl                 |
| Job card grid | 1 column                  | 2 columns lg:3 columns   |
| Dashboard     | Bottom tab bar            | Sidebar (240px)          |
| Search bar    | Stacked (title / location)| Inline row               |
| Container     | px-4                      | px-6 lg:px-8             |
