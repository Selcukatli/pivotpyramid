"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Pencil } from "lucide-react";
import { useCanvas } from "./canvas-provider";

export function CanvasHeader() {
  const { name, updateName, isSaving } = useCanvas();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateName(editedName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setEditedName(name);
      setIsEditing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-xl border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
        {/* Back link - update this to your desired route */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        {/* Canvas name */}
        <div className="flex-1 flex items-center justify-center">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                className="text-lg font-semibold text-center bg-transparent border-b-2 border-amber-400 focus:outline-none focus:border-amber-500 px-2 text-stone-800"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditedName(name);
                setIsEditing(true);
              }}
              className="flex items-center gap-2 text-lg font-semibold text-stone-800 hover:text-amber-600 transition-colors group"
            >
              {name}
              <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400" />
            </button>
          )}
        </div>

        {/* Save status */}
        <div className="text-xs min-w-[80px] text-right">
          {isSaving ? (
            <span className="flex items-center gap-1.5 justify-end text-stone-400">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Saving
            </span>
          ) : (
            <span className="flex items-center gap-1.5 justify-end text-emerald-600">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
