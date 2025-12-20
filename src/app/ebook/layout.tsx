import { Merriweather, Inter } from 'next/font/google';
import { getGroupedTableOfContents } from '@/lib/ebook-parser';
import { EbookSidebar, ReadingProgress } from '@/components/ebook';
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
      <ReadingProgress />
      <EbookSidebar groups={groups} />

      {/* Main content area */}
      <main className="lg:ml-72">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12">
          {children}
        </div>
      </main>
    </div>
  );
}
