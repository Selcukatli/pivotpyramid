'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useEbookAccessStore } from '@/stores/ebookAccessStore';
import { AccessModal } from './AccessModal';

interface EbookCTAButtonsProps {
  firstChapterSlug?: string;
}

export function EbookCTAButtons({ firstChapterSlug }: EbookCTAButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasAccess = useEbookAccessStore((state) => state.hasAccess);

  // If user has access, navigate directly to first chapter
  // Otherwise, show the access modal
  if (hasAccess && firstChapterSlug) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
        <Link
          href={`/ebook/${firstChapterSlug}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg min-w-[160px]"
        >
          <Sparkles className="w-4 h-4" />
          Start Reading
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg min-w-[160px]"
        >
          <Sparkles className="w-4 h-4" />
          Get Early Access
        </button>
      </div>

      <AccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
