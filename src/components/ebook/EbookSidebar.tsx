'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableOfContents } from './TableOfContents';
import { ReadingProgress } from './ReadingProgress';
import type { TableOfContentsItem } from '@/lib/ebook-parser';

interface EbookSidebarProps {
  groups: { part: string | null; items: TableOfContentsItem[] }[];
}

export function EbookSidebar({ groups }: EbookSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile navigation cluster - top right */}
      <div className="lg:hidden fixed top-4 right-4 z-40 flex items-center gap-2">
        {/* Reading progress - smaller, to the left of hamburger */}
        <ReadingProgress size="sm" />

        {/* Hamburger menu button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors"
          aria-label="Open table of contents"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 w-72 h-screen bg-stone-50 border-r border-stone-200 overflow-y-auto pb-16">
        {/* Home link */}
        <div className="sticky top-0 bg-stone-50 border-b border-stone-200 px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        <div className="pt-4">
          <TableOfContents groups={groups} />
        </div>
      </aside>

      {/* Mobile drawer - slides from right */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer - slides from right */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 w-80 max-w-[85vw] h-full bg-white shadow-xl overflow-y-auto"
            >
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
              <div className="px-4 py-3 border-b border-stone-100">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-600 transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
              <div className="p-4">
                <TableOfContents
                  groups={groups}
                  onItemClick={() => setIsMobileOpen(false)}
                />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
