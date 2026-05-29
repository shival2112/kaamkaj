import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ConditionalNavbar } from '@/components/layout/ConditionalNavbar';
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalNavbar />
        {children}
      </body>
    </html>
  );
}
