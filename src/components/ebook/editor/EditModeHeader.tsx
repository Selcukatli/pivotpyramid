'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Save,
  X,
  Loader2,
  Edit3,
  Eye,
  Command,
} from 'lucide-react';

interface EditModeHeaderProps {
  title: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onExit: () => void;
  slug: string;
}

export function EditModeHeader({
  title,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onExit,
  slug,
}: EditModeHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left: Edit indicator + title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg">
            <Edit3 className="w-4 h-4" />
            <span className="text-sm font-medium">Editing</span>
          </div>
          <h1 className="text-sm font-semibold text-stone-800 truncate hidden sm:block">
            {title}
          </h1>
          {hasUnsavedChanges && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-2 h-2 bg-amber-500 rounded-full"
              title="Unsaved changes"
            />
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Keyboard shortcut hints */}
          <div className="hidden md:flex items-center gap-4 mr-4 text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              <span>S</span>
              <span className="text-stone-300">save</span>
            </span>
            <span className="flex items-center gap-1">
              <span>Esc</span>
              <span className="text-stone-300">exit</span>
            </span>
          </div>

          {/* View button */}
          <Link
            href={`/ebook/${slug}`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View</span>
          </Link>

          {/* Save button */}
          <button
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              hasUnsavedChanges
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isSaving ? 'Saving...' : 'Save'}
            </span>
          </button>

          {/* Exit button */}
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
