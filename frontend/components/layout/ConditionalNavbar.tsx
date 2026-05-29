'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/employer')) return null;
  return <Navbar />;
}
