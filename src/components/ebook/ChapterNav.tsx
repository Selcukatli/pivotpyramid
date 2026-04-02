'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TableOfContentsItem } from '@/lib/ebook-convex';

interface ChapterNavProps {
  previous: TableOfContentsItem | null;
  next: TableOfContentsItem | null;
}

export function ChapterNav({ previous, next }: ChapterNavProps) {
  return (
    <nav className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4 pt-8 mt-12 border-t border-stone-200">
      {/* Previous - shown second on mobile (order-2), first on desktop (sm:order-1) */}
      {previous ? (
        <Link
          href={`/ebook/${previous.slug}`}
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors group w-full sm:flex-1 sm:max-w-xs order-2 sm:order-1"
        >
          <ChevronLeft className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
          <div className="text-left min-w-0">
            <div className="text-xs text-stone-400 uppercase tracking-wide">Previous</div>
            <div className="text-sm font-medium truncate">
              {previous.type === 'chapter' && previous.chapterNumber && (
                <span className="text-stone-400 mr-1">Ch. {previous.chapterNumber}:</span>
              )}
              {previous.title}
            </div>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block sm:flex-1 sm:max-w-xs order-2 sm:order-1" />
      )}

      {/* Next - shown first on mobile (order-1), second on desktop (sm:order-2) */}
      {next ? (
        <Link
          href={`/ebook/${next.slug}`}
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors group w-full sm:flex-1 sm:max-w-xs sm:justify-end order-1 sm:order-2"
        >
          <div className="text-left sm:text-right min-w-0 order-2 sm:order-1">
            <div className="text-xs text-stone-400 uppercase tracking-wide">Next</div>
            <div className="text-sm font-medium truncate">
              {next.type === 'chapter' && next.chapterNumber && (
                <span className="text-stone-400 mr-1">Ch. {next.chapterNumber}:</span>
              )}
              {next.title}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors flex-shrink-0 order-1 sm:order-2" />
        </Link>
      ) : (
        <div className="hidden sm:block sm:flex-1 sm:max-w-xs order-1 sm:order-2" />
      )}
    </nav>
  );
}
