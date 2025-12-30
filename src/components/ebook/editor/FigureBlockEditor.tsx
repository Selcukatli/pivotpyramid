'use client';

import { useState } from 'react';
import type { Id } from '../../../../convex/_generated/dataModel';
import type { EditorFigure } from './ChapterEditor';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Edit3, Trash2 } from 'lucide-react';
import { FigureLightbox } from './FigureLightbox';

interface FigureBlockEditorProps {
  blockId: Id<'ebookBlocks'>;
  draftId: Id<'ebookDrafts'>;
  figure?: EditorFigure;
  onFigureCreated: (figureId: Id<'ebookFigures'>) => void;
  onFigureUpdated: (figure: EditorFigure) => void;
  onDelete?: () => void;
}

export function FigureBlockEditor({
  blockId,
  draftId,
  figure,
  onFigureCreated,
  onFigureUpdated,
  onDelete,
}: FigureBlockEditorProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      {/* Compact inline view */}
      {figure?.url ? (
        <motion.div
          onClick={() => setIsLightboxOpen(true)}
          whileHover={{ scale: 1.005 }}
          className="relative group cursor-pointer rounded-xl overflow-hidden bg-stone-50 border border-stone-200 hover:border-amber-400 transition-colors"
        >
          {/* Delete button - top right corner */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
              title="Delete figure block"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Image preview */}
          <div className="relative aspect-video bg-stone-100">
            <Image
              src={figure.url}
              alt={figure.alt}
              fill
              className="object-contain"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-stone-700">
                <Edit3 className="w-4 h-4" />
                Edit Figure
              </div>
            </div>
          </div>

          {/* Metadata summary */}
          <div className="px-4 py-3 bg-white">
            {figure.caption && (
              <p className="text-sm text-stone-700 italic mb-1">{figure.caption}</p>
            )}
            <p className="text-xs text-stone-400 truncate">
              {figure.alt}
            </p>
            {figure.prompt && (
              <p className="text-xs text-amber-600/80 truncate mt-1">
                Prompt: {figure.prompt}
              </p>
            )}
          </div>
        </motion.div>
      ) : (
        /* Empty state - click to add */
        <motion.div
          onClick={() => setIsLightboxOpen(true)}
          whileHover={{ scale: 1.005 }}
          className="flex flex-col items-center justify-center h-40 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 cursor-pointer transition-colors"
        >
          <ImageIcon className="w-10 h-10 text-stone-300 mb-2" />
          <p className="text-sm text-stone-400 font-medium">Click to add figure</p>
          <p className="text-xs text-stone-400 mt-1">Upload or generate with AI</p>
        </motion.div>
      )}

      {/* Lightbox modal */}
      <FigureLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        blockId={blockId}
        draftId={draftId}
        figure={figure}
        onFigureCreated={onFigureCreated}
        onFigureUpdated={onFigureUpdated}
      />
    </>
  );
}
