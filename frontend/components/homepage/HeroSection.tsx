import { SearchBar } from './SearchBar';

const POPULAR_SEARCHES = [
  'Sales Executive',
  'Software Engineer',
  'Delivery Partner',
  'BPO Executive',
  'Accountant',
  'Work from Home',
] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary via-secondary/40 to-background">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        {/* Trust badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            Trusted by 1,000+ companies across India
          </span>
        </div>

        {/* Headline */}
        <div className="text-center">
          <h1 className="text-[2.6rem] font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            India&apos;s{' '}
            <span className="relative inline-block text-primary">
              #1 Job Platform
              {/* underline accent */}
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-primary/25" />
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground md:text-xl">
            Your job search ends here.{' '}
            <span className="font-semibold text-foreground">50 Lakh+</span> live
            opportunities from top employers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mt-10 max-w-3xl">
          <SearchBar />
        </div>

        {/* Popular searches */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <a
              key={term}
              href={`/jobs?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground shadow-sm transition-colors hover:border-primary/60 hover:text-primary"
            >
              {term}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
