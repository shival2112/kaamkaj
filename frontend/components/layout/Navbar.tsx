'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/jobs', label: 'Find Jobs' },
  { href: '/companies', label: 'Companies' },
  { href: '/resources', label: 'Resources' },
] as const;

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-white transition-all duration-200',
        isScrolled ? 'shadow-md' : 'border-b border-border'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobile}
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">Kaam</span>
            <span className="text-foreground">Kaaj</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="outline"
            asChild
            className="border-primary text-primary hover:bg-secondary hover:text-primary"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up Free</Link>
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu — slide down */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 md:hidden',
          isMobileOpen ? 'max-h-96 border-t border-border' : 'max-h-0'
        )}
      >
        <div className="mx-auto max-w-7xl space-y-1 bg-white px-4 pb-5 pt-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              asChild
              className="w-full border-primary text-primary hover:bg-secondary hover:text-primary"
            >
              <Link href="/login" onClick={closeMobile}>
                Login
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/signup" onClick={closeMobile}>
                Sign Up Free
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
