'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { TableOfContents } from './TableOfContents';
import type { TableOfContentsItem } from '@/lib/ebook-parser';

interface EbookSidebarProps {
  groups: { part: string | null; items: TableOfContentsItem[] }[];
}

export function EbookSidebar({ groups }: EbookSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors"
        aria-label="Open table of contents"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 w-72 h-screen bg-stone-50 border-r border-stone-200 overflow-y-auto pt-8 pb-16">
        <TableOfContents groups={groups} />
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 w-80 max-w-[85vw] h-full bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800">Contents</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-700 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <TableOfContents
                groups={groups}
                onItemClick={() => setIsMobileOpen(false)}
              />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
