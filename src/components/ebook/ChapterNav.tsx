'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TableOfContentsItem } from '@/lib/ebook-parser';

interface ChapterNavProps {
  previous: TableOfContentsItem | null;
  next: TableOfContentsItem | null;
}

export function ChapterNav({ previous, next }: ChapterNavProps) {
  return (
    <nav className="flex items-center justify-between gap-4 pt-8 mt-12 border-t border-stone-200">
      {previous ? (
        <Link
          href={`/ebook/${previous.slug}`}
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors group flex-1 max-w-xs"
        >
          <ChevronLeft className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
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
        <div className="flex-1 max-w-xs" />
      )}

      {next ? (
        <Link
          href={`/ebook/${next.slug}`}
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors group flex-1 max-w-xs justify-end"
        >
          <div className="text-right min-w-0">
            <div className="text-xs text-stone-400 uppercase tracking-wide">Next</div>
            <div className="text-sm font-medium truncate">
              {next.type === 'chapter' && next.chapterNumber && (
                <span className="text-stone-400 mr-1">Ch. {next.chapterNumber}:</span>
              )}
              {next.title}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
        </Link>
      ) : (
        <div className="flex-1 max-w-xs" />
      )}
    </nav>
  );
}
