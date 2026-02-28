'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ShoppingBag, ExternalLink } from 'lucide-react';
import { useEbookAccessStore } from '@/stores/ebookAccessStore';
import { AccessModal } from './AccessModal';

interface EbookCTAButtonsProps {
  firstChapterSlug?: string;
}

function AmazonLinks() {
  return (
    <div className="flex items-center gap-4 mt-3">
      <a
        href="https://www.amazon.com/dp/B0GPNMPXCH"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-amber-600 transition-colors"
      >
        Kindle Edition
        <ExternalLink className="w-3 h-3" />
      </a>
      <span className="text-stone-300">·</span>
      <a
        href="https://www.amazon.com/dp/B0GPXTMTGQ"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-amber-600 transition-colors"
      >
        Paperback
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

export function EbookCTAButtons({ firstChapterSlug }: EbookCTAButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasAccess = useEbookAccessStore((state) => state.hasAccess);

  // If user has access, navigate directly to first chapter
  // Otherwise, show the access modal
  if (hasAccess && firstChapterSlug) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
          <a
            href="https://www.amazon.com/dp/B0GPNMPXCH"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg min-w-[160px]"
          >
            <ShoppingBag className="w-4 h-4" />
            Buy on Amazon
          </a>
          <Link
            href={`/ebook/${firstChapterSlug}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-stone-300 text-stone-700 rounded-lg font-semibold hover:border-stone-400 hover:bg-stone-50 transition-all min-w-[160px]"
          >
            <Sparkles className="w-4 h-4" />
            Read Ebook
          </Link>
        </div>
        <AmazonLinks />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
          <a
            href="https://www.amazon.com/dp/B0GPNMPXCH"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg min-w-[160px]"
          >
            <ShoppingBag className="w-4 h-4" />
            Buy on Amazon
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-stone-300 text-stone-700 rounded-lg font-semibold hover:border-stone-400 hover:bg-stone-50 transition-all min-w-[160px]"
          >
            <Sparkles className="w-4 h-4" />
            Read Ebook
          </button>
        </div>
        <AmazonLinks />
      </div>

      <AccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
