import { notFound } from 'next/navigation';
import {
  getChapterBySlug,
  getAdjacentChapters,
  getAllChapterSlugs,
} from '@/lib/ebook-convex';
import { MarkdownRenderer, ChapterNav } from '@/components/ebook';
import { EbookAccessGate } from '@/components/ebook/EbookAccessGate';
import type { Metadata } from 'next';

interface ChapterPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllChapterSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const chapter = await getChapterBySlug(slug);

  if (!chapter) {
    return {
      title: 'Chapter Not Found',
    };
  }

  const title = chapter.type === 'chapter' && chapter.chapterNumber
    ? `Chapter ${chapter.chapterNumber}: ${chapter.title}`
    : chapter.title;

  const description = chapter.type === 'chapter' && chapter.chapterNumber
    ? `Chapter ${chapter.chapterNumber} of The Pivot Pyramid: ${chapter.title}. ${chapter.part ? `${chapter.part}.` : ''} Free online ebook by Selçuk Atlı.`
    : `${chapter.title} - The Pivot Pyramid ebook. ${chapter.part ? `${chapter.part}.` : ''} Free online by Selçuk Atlı.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://pivotpyramid.com/ebook/${slug}`,
    },
    openGraph: {
      title: `${title} | The Pivot Pyramid`,
      description,
      url: `https://pivotpyramid.com/ebook/${slug}`,
      type: 'article',
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
      title: `${title} | The Pivot Pyramid`,
      description,
      images: ['/pivot-pyramid-cover.png'],
      creator: '@selcukatli',
    },
  };
}

// Generate Article structured data for chapter pages
function getArticleJsonLd(slug: string, title: string, chapterNumber?: number, part?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    author: {
      "@type": "Person",
      name: "Selçuk Atlı",
      url: "https://selcukatli.com",
    },
    publisher: {
      "@type": "Person",
      name: "Selçuk Atlı",
    },
    datePublished: "2024-01-01",
    dateModified: "2024-01-01",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://pivotpyramid.com/ebook/${slug}`,
    },
    image: "https://pivotpyramid.com/pivot-pyramid-cover.png",
    isPartOf: {
      "@type": "Book",
      name: "The Pivot Pyramid",
      url: "https://pivotpyramid.com/ebook",
    },
    ...(chapterNumber && { position: chapterNumber }),
    ...(part && { articleSection: part }),
  };
}

// BreadcrumbList for chapter navigation
function getBreadcrumbJsonLd(slug: string, title: string) {
  return {
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
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `https://pivotpyramid.com/ebook/${slug}`,
      },
    ],
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = await getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const { previous, next } = await getAdjacentChapters(slug);

  const title = chapter.type === 'chapter' && chapter.chapterNumber
    ? `Chapter ${chapter.chapterNumber}: ${chapter.title}`
    : chapter.title;

  const articleJsonLd = getArticleJsonLd(slug, title, chapter.chapterNumber, chapter.part);
  const breadcrumbJsonLd = getBreadcrumbJsonLd(slug, title);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <EbookAccessGate>
        <article className="ebook-chapter">
          {/* Chapter header */}
          {chapter.part && (
            <div className="text-sm font-medium text-amber-600 uppercase tracking-wider mb-2">
              {chapter.part}
            </div>
          )}

          {/* Chapter content */}
          <div className="prose-stone">
            <MarkdownRenderer content={chapter.content} />
          </div>

          {/* Navigation */}
          <ChapterNav previous={previous} next={next} />
        </article>
      </EbookAccessGate>
    </>
  );
}
