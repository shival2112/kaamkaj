import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ConditionalNavbar } from '@/components/layout/ConditionalNavbar';
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';
import { AppAuthProvider } from '@/context/AppAuthContext';
import { NextAuthProvider } from '@/components/auth/NextAuthProvider';
import { AuthModal } from '@/components/auth/AuthModal';
import { ServiceWorkerRegistrar } from '@/components/layout/ServiceWorkerRegistrar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'KaamKaaj — Find Jobs, Hire Talent',
    template: '%s | KaamKaaj',
  },
  description:
    'KaamKaaj is a modern job portal connecting candidates with great opportunities across India.',
  keywords: ['jobs', 'hiring', 'career', 'employment', 'India', 'job search'],
  manifest: '/manifest.json',
  themeColor: '#007a5a',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.svg',
    shortcut: '/logo.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KaamKaaj',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <AppAuthProvider>
            {/* Skip to main content for keyboard / screen-reader users */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
              Skip to main content
            </a>
            <AnnouncementBanner />
            <ConditionalNavbar />
            <AuthModal />
            <main id="main-content">{children}</main>
            <ServiceWorkerRegistrar />
          </AppAuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
