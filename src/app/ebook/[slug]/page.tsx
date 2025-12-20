import { notFound } from 'next/navigation';
import { getChapterBySlug, getAdjacentChapters, getAllChapterSlugs } from '@/lib/ebook-parser';
import { MarkdownRenderer, ChapterNav } from '@/components/ebook';
import type { Metadata } from 'next';

interface ChapterPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllChapterSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    return {
      title: 'Chapter Not Found',
    };
  }

  const title = chapter.type === 'chapter' && chapter.chapterNumber
    ? `Chapter ${chapter.chapterNumber}: ${chapter.title}`
    : chapter.title;

  return {
    title,
    description: `Read "${chapter.title}" from The Pivot Pyramid ebook. ${chapter.part ? `Part of ${chapter.part}.` : ''}`,
    alternates: {
      canonical: `https://pivotpyramid.com/ebook/${slug}`,
    },
    openGraph: {
      title: `${title} | The Pivot Pyramid`,
      description: `Read this chapter from The Pivot Pyramid ebook online.`,
      url: `https://pivotpyramid.com/ebook/${slug}`,
      type: 'article',
    },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const { previous, next } = getAdjacentChapters(slug);

  return (
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
  );
}
