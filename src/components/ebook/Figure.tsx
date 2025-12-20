'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            <div className="relative rounded-lg overflow-hidden">
              {/* Skeleton loader - only render while loading */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] animate-pulse rounded-lg" />
              )}

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

            {/* Hand-drawn border overlay - tighter to match rounded-lg (8px radius) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 400 300"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 12 3 Q 14 2, 20 2 L 100 3 Q 150 2, 200 3 L 300 2 Q 350 3, 380 2 L 388 3 Q 396 3, 398 12 L 398 20 Q 397 80, 398 150 L 397 220 Q 398 260, 398 288 Q 398 296, 388 298 L 380 298 Q 300 297, 200 298 L 100 297 Q 50 298, 20 298 L 12 298 Q 3 298, 2 288 L 2 280 Q 3 220, 2 150 L 3 80 Q 2 40, 2 12 Q 2 3, 12 3 Z"
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

      {/* Lightbox with slide-up animation */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="w-8 h-8" />
            </motion.button>
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                width={1200}
                height={900}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
