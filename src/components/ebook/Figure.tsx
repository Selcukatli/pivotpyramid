'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';

interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
}

export function Figure({ src, alt, caption }: FigureProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <figure className="my-8 text-center">
        <div
          className="relative inline-block cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={src}
            alt={alt}
            width={800}
            height={600}
            className="rounded-lg shadow-md border border-stone-200 max-w-full h-auto mx-auto hover:shadow-lg transition-shadow"
            style={{ width: 'auto', height: 'auto', maxHeight: '500px' }}
          />
        </div>
        {caption && (
          <figcaption className="mt-3 text-sm text-stone-500 italic">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={900}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
