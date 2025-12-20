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
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      <figure className="my-8 text-center">
        <div className="relative inline-block max-w-full">
          {/* Decorative elements */}
          {/* Top left dots */}
          <div className="absolute -top-3 -left-3 flex gap-1.5 z-20">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2 h-2 rounded-full border-2 border-amber-500" />
          </div>

          {/* Top right star */}
          <svg
            className="absolute -top-4 -right-1 w-5 h-5 text-amber-500 z-20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z" />
          </svg>

          {/* Bottom left sparkle */}
          <svg
            className="absolute -bottom-3 left-6 w-4 h-4 text-amber-500 z-20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
          </svg>

          {/* Bottom right dots */}
          <div className="absolute -bottom-3 -right-3 flex gap-1.5 z-20">
            <div className="w-2 h-2 rounded-full border-2 border-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          </div>

          {/* Main frame container */}
          <div
            className="relative cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          >
            {/* Image container with rounded corners */}
            <div className="relative rounded-2xl overflow-hidden">
              {/* Skeleton loader */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] animate-pulse rounded-2xl transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-0' : 'opacity-100'
                }`}
              />

              <Image
                src={src}
                alt={alt}
                width={800}
                height={600}
                className="max-w-full h-auto mx-auto hover:scale-[1.02] transition-transform duration-300"
                style={{ width: 'auto', height: 'auto', maxHeight: '500px' }}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Hand-drawn border overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 400 300"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 30 8 Q 35 4, 50 6 L 100 4 Q 130 3, 160 5 L 220 4 Q 280 3, 340 6 L 360 5 Q 380 4, 388 12 Q 394 20, 392 40 L 394 80 Q 395 120, 393 160 L 394 200 Q 395 240, 392 260 Q 388 280, 380 288 Q 370 294, 350 292 L 280 294 Q 220 295, 160 293 L 100 294 Q 60 295, 30 292 Q 12 288, 8 270 Q 4 250, 6 200 L 4 140 Q 3 80, 6 40 Q 8 20, 18 10 Q 24 5, 30 8 Z"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {caption && (
          <figcaption className="mt-4 text-sm text-stone-500 italic">
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
