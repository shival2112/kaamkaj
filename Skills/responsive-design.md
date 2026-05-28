# Responsive Design Skill — KaamKaaj

## Philosophy
Mobile-first: write base styles for mobile, then layer desktop with md: lg: xl: prefixes.

## Breakpoints
| Prefix | Min Width | Target                    |
|--------|-----------|---------------------------|
| (none) | 0px       | Mobile (375px–639px)      |
| sm:    | 640px     | Large phones, small tablet|
| md:    | 768px     | Tablet portrait, breakpoint for navbar, sidebar |
| lg:    | 1024px    | Desktop (primary layout)  |
| xl:    | 1280px    | Wide desktop              |

## Key Breakpoint Behaviors

### Navbar
- < md: Logo + hamburger only
- ≥ md: Logo + nav links + auth buttons (full)

### Homepage Hero
- Mobile: `text-3xl font-bold`, stacked CTA buttons, full-width search
- md+: `text-5xl font-bold`, side-by-side CTAs, inline search row

### Job Cards Grid
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

### Dashboard Layout
- Mobile: No sidebar, bottom tab bar (4 icons, h-16 fixed)
- md+: Sidebar (240px) + main content

### Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Search Bar
```tsx
// Mobile: stacked
<div className="flex flex-col gap-3 sm:flex-row">
  <input className="w-full sm:flex-1" placeholder="Job title or keyword" />
  <input className="w-full sm:flex-1" placeholder="Location" />
  <button className="w-full sm:w-auto">Search</button>
</div>
```

## Common Responsive Patterns

### Hide/Show
```tsx
<div className="hidden md:flex">   {/* Show on md+ */}
<div className="md:hidden">        {/* Show on mobile only */}
<div className="hidden lg:block">  {/* Show on lg+ */}
```

### Typography Scaling
```tsx
<h1 className="text-3xl font-bold md:text-5xl">
<p className="text-base md:text-lg">
<span className="text-xs sm:text-sm">
```

### Spacing Scaling
```tsx
<section className="py-10 md:py-16 lg:py-20">
<div className="p-4 md:p-6 lg:p-8">
<div className="gap-4 md:gap-6 lg:gap-8">
```

### Sidebar Pattern
```tsx
// Dashboard shell
<div className="flex min-h-screen">
  {/* Sidebar — desktop only */}
  <aside className="hidden md:flex w-60 flex-col fixed inset-y-0 pt-16 border-r border-border bg-white">
    {/* sidebar content */}
  </aside>

  {/* Main content */}
  <main className="flex-1 md:ml-60 p-4 md:p-6">
    {children}
  </main>

  {/* Bottom tab bar — mobile only */}
  <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border flex md:hidden">
    {/* 4 icon tabs */}
  </nav>
</div>
```

## Accessibility Responsive Considerations
- Touch targets minimum 44x44px (use `min-h-[44px] min-w-[44px]` or `p-3` on icons)
- Font size minimum 16px on inputs to prevent iOS zoom (`text-base`)
- Adequate contrast on all color combinations

## Image Responsiveness
```tsx
import Image from 'next/image';
<Image
  src={logoUrl}
  alt="Company logo"
  width={40}
  height={40}
  className="rounded-full object-cover"
/>

// Full-width responsive hero image
<Image
  src={heroImage}
  alt="Hero"
  fill
  className="object-cover"
  priority
/>
```

## Testing Responsive Behavior
Breakpoints to always test:
- 375px (iPhone SE)
- 768px (iPad portrait)
- 1024px (tablet landscape / small laptop)
- 1280px (standard desktop)
