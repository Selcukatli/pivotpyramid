import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ArrowRight, User, FileText } from 'lucide-react';
import { getGroupedTableOfContents } from '@/lib/ebook-parser';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Pivot Pyramid - Free Ebook',
  description: 'Read The Pivot Pyramid ebook online. A comprehensive guide to startup experimentation and pivoting by Selçuk Atlı (YC W14).',
  alternates: {
    canonical: 'https://pivotpyramid.com/ebook',
  },
  openGraph: {
    title: 'The Pivot Pyramid - Free Ebook',
    description: 'A comprehensive guide to startup experimentation and pivoting. Read online for free.',
    url: 'https://pivotpyramid.com/ebook',
    type: 'book',
  },
};

export default function EbookLandingPage() {
  const groups = getGroupedTableOfContents();

  // Get first chapter for the CTA
  const firstChapter = groups[0]?.items[0];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <header className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6">
          <BookOpen className="w-4 h-4" />
          Free Online Ebook
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 font-[family-name:var(--font-inter)]">
          The Pivot Pyramid
        </h1>

        <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-8">
          A comprehensive guide to startup experimentation and pivoting.
          Master the framework that helps founders understand where to pivot
          and how changes cascade through their business.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {firstChapter && (
            <Link
              href={`/ebook/${firstChapter.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
            >
              Start Reading
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}

          <Link
            href="/ebook/pivot-pyramid-ebook-styled.pdf"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Download PDF
          </Link>
        </div>
      </header>

      {/* Author Section */}
      <section className="flex items-center gap-4 p-6 bg-stone-50 rounded-2xl">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-stone-900 font-[family-name:var(--font-inter)]">
            Selçuk Atlı
          </h2>
          <p className="text-stone-600 text-sm">
            Serial entrepreneur (YC W14), former Venture Partner at 500 Startups,
            and creator of the Pivot Pyramid framework.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section>
        <h2 className="text-2xl font-bold text-stone-900 mb-6 font-[family-name:var(--font-inter)]">
          Table of Contents
        </h2>

        <div className="space-y-8">
          {groups.map((group, index) => (
            <div key={index}>
              {group.part && (
                <h3 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
                  {group.part}
                </h3>
              )}

              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/ebook/${item.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors group"
                    >
                      <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm font-medium text-stone-500 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                        {item.type === 'chapter' && item.chapterNumber
                          ? item.chapterNumber
                          : item.type === 'appendix'
                          ? 'A'
                          : '•'}
                      </span>
                      <span className="text-stone-700 group-hover:text-stone-900 transition-colors">
                        {item.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-500 transition-colors ml-auto" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-stone-200">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-semibold text-stone-900 mb-1">14 Chapters</h3>
          <p className="text-sm text-stone-500">Comprehensive coverage of the framework</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-semibold text-stone-900 mb-1">3 Appendices</h3>
          <p className="text-sm text-stone-500">Worksheets, case studies & resources</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Image
              src="/ebook/figures/pivot-pyramid-figure-1.png"
              alt="Pivot Pyramid"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </div>
          <h3 className="font-semibold text-stone-900 mb-1">20+ Figures</h3>
          <p className="text-sm text-stone-500">Visual diagrams and illustrations</p>
        </div>
      </section>
    </div>
  );
}
