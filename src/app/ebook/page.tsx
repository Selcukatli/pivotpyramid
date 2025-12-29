import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ArrowRight, FileText, ImageIcon } from 'lucide-react';
import { getGroupedTableOfContents, getTableOfContents } from '@/lib/ebook-convex';
import { BookCoverVideo } from '@/components/ebook/BookCoverVideo';
import { EbookCTAButtons } from '@/components/ebook/EbookCTAButtons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Pivot Pyramid - Early Access Ebook',
  description: 'Read The Pivot Pyramid ebook online. A comprehensive guide to startup experimentation and pivoting by Selçuk Atlı (YC W14).',
  alternates: {
    canonical: 'https://pivotpyramid.com/ebook',
  },
  openGraph: {
    title: 'The Pivot Pyramid - Early Access Ebook',
    description: 'A comprehensive guide to startup experimentation and pivoting.',
    url: 'https://pivotpyramid.com/ebook',
    type: 'book',
    images: [
      {
        url: '/pivot-pyramid-cover.png',
        width: 800,
        height: 1174,
        alt: 'The Pivot Pyramid Book Cover',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Pivot Pyramid - Early Access Ebook',
    description: 'A comprehensive guide to startup experimentation and pivoting.',
    images: ['/pivot-pyramid-cover.png'],
    creator: '@selcukatli',
  },
};

// Book structured data for Google
async function getBookJsonLd() {
  const toc = await getTableOfContents();
  const chapters = toc.filter(item => item.type === 'chapter');

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": "https://pivotpyramid.com/ebook#book",
    name: "The Pivot Pyramid",
    description: "A comprehensive guide to startup experimentation and pivoting. Master the framework that helps founders understand where to pivot and how changes cascade through their business.",
    author: {
      "@type": "Person",
      name: "Selçuk Atlı",
      url: "https://selcukatli.com",
      sameAs: [
        "https://twitter.com/selcukatli",
        "https://www.linkedin.com/in/selcukatli",
      ],
    },
    publisher: {
      "@type": "Person",
      name: "Selçuk Atlı",
    },
    inLanguage: "en",
    genre: ["Business", "Entrepreneurship", "Startups"],
    about: [
      { "@type": "Thing", name: "Startup Pivoting" },
      { "@type": "Thing", name: "Product-Market Fit" },
      { "@type": "Thing", name: "Business Strategy" },
    ],
    numberOfPages: 190,
    bookFormat: "https://schema.org/EBook",
    isAccessibleForFree: true,
    url: "https://pivotpyramid.com/ebook",
    image: "https://pivotpyramid.com/pivot-pyramid-cover.png",
    datePublished: "2024-01-01",
    copyrightYear: 2024,
    copyrightHolder: {
      "@type": "Person",
      name: "Selçuk Atlı",
    },
    hasPart: chapters.map((chapter, index) => ({
      "@type": "Chapter",
      name: chapter.title,
      position: index + 1,
      url: `https://pivotpyramid.com/ebook/${chapter.slug}`,
    })),
  };
}

// BreadcrumbList for navigation
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://pivotpyramid.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Ebook",
      item: "https://pivotpyramid.com/ebook",
    },
  ],
};

export default async function EbookLandingPage() {
  const groups = await getGroupedTableOfContents();
  const bookJsonLd = await getBookJsonLd();

  // Get first chapter for the CTA
  const firstChapter = groups[0]?.items[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="space-y-12">
      {/* Hero Section */}
      <header className="py-8">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Book Cover with scroll-controlled page flip animation */}
          <div className="flex-shrink-0">
            <BookCoverVideo
              videoSrc="/ebook-cover-video.mp4"
              posterSrc="/pivot-pyramid-cover.png"
              alt="The Pivot Pyramid Book Cover"
              width={220}
              height={323}
            />
          </div>

          {/* Text Content */}
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Early Access
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 font-[family-name:var(--font-inter)]">
              The Pivot Pyramid
            </h1>

            <p className="text-lg text-stone-600 mb-6">
              A comprehensive guide to startup experimentation and pivoting.
              Master the framework that helps founders understand where to pivot
              and how changes cascade through their business.
            </p>

            <EbookCTAButtons firstChapterSlug={firstChapter?.slug} />
          </div>
        </div>
      </header>

      {/* About the Author */}
      <section className="bg-stone-50 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-stone-900 mb-4 font-[family-name:var(--font-inter)]">
              About the Author
            </h2>
            <div className="space-y-3">
              <p className="text-stone-600 text-sm leading-relaxed">
                <strong className="text-stone-900">Selçuk Atlı</strong> is a serial entrepreneur, investor, and songwriter based in New York.
              </p>
              <p className="text-stone-600 text-sm leading-relaxed">
                Most recently, he founded <strong>Bunch</strong>, a group video chat app for playing games together, used by over 10 million players. Before that, he founded and sold two adtech companies: <strong>Socialwire/Manifest</strong> (acquired by Rakuten in 2014) and <strong>Boostable</strong> (acquired by Metric Collective).
              </p>
              <p className="text-stone-600 text-sm leading-relaxed">
                He conceptualized the Pivot Pyramid while serving as a Venture Partner at <strong>500 Startups</strong>, where he worked with dozens of early-stage founders navigating the search for product-market fit. He is also a <strong>Y Combinator W14</strong> alumni.
              </p>
              <p className="text-stone-600 text-sm">
                <a href="https://selcukatli.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 no-underline hover:underline">
                  Learn more →
                </a>
              </p>
            </div>
          </div>
          <Image
            src="/selcuk-photo.jpg"
            alt="Selçuk Atlı"
            width={96}
            height={96}
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0 order-first sm:order-last"
          />
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
            <ImageIcon className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-semibold text-stone-900 mb-1">20+ Figures</h3>
          <p className="text-sm text-stone-500">Visual diagrams and illustrations</p>
        </div>
      </section>
      </div>
    </>
  );
}
