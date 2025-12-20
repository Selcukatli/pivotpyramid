'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, BookOpen } from 'lucide-react';
import type { TableOfContentsItem } from '@/lib/ebook-parser';

interface TableOfContentsProps {
  groups: { part: string | null; items: TableOfContentsItem[] }[];
  onItemClick?: () => void;
}

export function TableOfContents({ groups, onItemClick }: TableOfContentsProps) {
  const pathname = usePathname();
  const currentSlug = pathname.split('/').pop();

  return (
    <nav className="space-y-6">
      <div className="flex items-center gap-2 px-3">
        <BookOpen className="w-5 h-5 text-amber-500" />
        <h2 className="font-semibold text-stone-800">Contents</h2>
      </div>

      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-1">
          {group.part && (
            <h3 className="px-3 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {group.part}
            </h3>
          )}

          {group.items.map((item) => {
            const isActive = item.slug === currentSlug;

            return (
              <Link
                key={item.slug}
                href={`/ebook/${item.slug}`}
                onClick={onItemClick}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                  ${isActive
                    ? 'bg-amber-100 text-amber-900 font-medium'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }
                `}
              >
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <span className={isActive ? '' : 'ml-6'}>
                  {item.type === 'chapter' && item.chapterNumber && (
                    <span className="text-stone-400 mr-1.5">
                      {item.chapterNumber}.
                    </span>
                  )}
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
