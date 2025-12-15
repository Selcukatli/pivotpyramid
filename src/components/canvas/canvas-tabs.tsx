"use client";

import { FileText, Layers } from "lucide-react";

export type CanvasTab = "profile" | "canvas";

interface CanvasTabsProps {
  activeTab: CanvasTab;
  onTabChange: (tab: CanvasTab) => void;
  hasProfile: boolean;
}

export function CanvasTabs({
  activeTab,
  onTabChange,
  hasProfile,
}: CanvasTabsProps) {
  return (
    <div className="inline-flex rounded-xl bg-stone-100 p-1">
      <button
        onClick={() => onTabChange("profile")}
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
          ${
            activeTab === "profile"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }
        `}
      >
        <FileText className="w-4 h-4" />
        Startup Profile
      </button>
      <button
        onClick={() => onTabChange("canvas")}
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
          ${
            activeTab === "canvas"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }
        `}
      >
        <Layers className="w-4 h-4" />
        Pivot Canvas
        {!hasProfile && (
          <span className="ml-1 w-2 h-2 bg-amber-400 rounded-full" />
        )}
      </button>
    </div>
  );
}
