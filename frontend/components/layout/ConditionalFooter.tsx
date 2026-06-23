'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/employer') || pathname.startsWith('/recruiter')) return null;
  return <Footer />;
}
