'use client';

import { useRef } from 'react';
import { Plus } from 'lucide-react';
import type { Id } from '../../../../convex/_generated/dataModel';

interface InsertBlockButtonProps {
  afterBlockId: Id<'ebookBlocks'> | null;
  onOpenSlashMenu: (
    afterBlockId: Id<'ebookBlocks'> | null,
    element: HTMLElement
  ) => void;
}

export function InsertBlockButton({
  afterBlockId,
  onOpenSlashMenu,
}: InsertBlockButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      onOpenSlashMenu(afterBlockId, buttonRef.current);
    }
  };

  return (
    <div className="group relative h-6 flex items-center justify-center">
      {/* Line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-stone-200 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Button */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        className="relative z-10 flex items-center gap-1.5 px-3 py-1 text-xs text-stone-400 hover:text-amber-600 bg-stone-100 hover:bg-amber-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add block</span>
      </button>
    </div>
  );
}
