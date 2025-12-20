import { Suspense } from 'react';
import { Merriweather, Inter } from 'next/font/google';
import { getGroupedTableOfContents } from '@/lib/ebook-parser';
import { EbookSidebar, ReadingProgress, PasswordUrlChecker } from '@/components/ebook';
import type { Metadata } from 'next';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | The Pivot Pyramid',
    default: 'The Pivot Pyramid - Free Ebook',
  },
  description: 'Read The Pivot Pyramid ebook online. A comprehensive guide to startup experimentation by Selçuk Atlı.',
};

export default function EbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const groups = getGroupedTableOfContents();

  return (
    <div className={`${merriweather.variable} ${inter.variable} min-h-screen bg-white`}>
      {/* Check for ?pwd= query param to auto-grant access */}
      <Suspense fallback={null}>
        <PasswordUrlChecker />
      </Suspense>
      <ReadingProgress />
      <EbookSidebar groups={groups} />

      {/* Main content area */}
      <main className="lg:ml-72">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12 pb-24">
          {children}
        </div>

        {/* Copyright footer */}
        <footer className="border-t border-stone-200 py-8 mt-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-stone-500">
            <p>
              <strong className="text-stone-700">The Pivot Pyramid</strong> &copy; {new Date().getFullYear()} Selçuk Atlı. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
