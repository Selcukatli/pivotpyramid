"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  Users,
  AlertCircle,
  Lightbulb,
  Cpu,
  Rocket,
} from "lucide-react";
import { ConfidenceSlider } from "./confidence-slider";
import type { LayerDefinition, LayerId } from "@/lib/pivot-pyramid-data";

const LAYER_CONFIG: Record<
  LayerId,
  { icon: React.ElementType; accent: string; accentLight: string }
> = {
  customers: {
    icon: Users,
    accent: "text-amber-600",
    accentLight: "bg-amber-50 border-amber-200",
  },
  problem: {
    icon: AlertCircle,
    accent: "text-rose-600",
    accentLight: "bg-rose-50 border-rose-200",
  },
  solution: {
    icon: Lightbulb,
    accent: "text-emerald-600",
    accentLight: "bg-emerald-50 border-emerald-200",
  },
  technology: {
    icon: Cpu,
    accent: "text-sky-600",
    accentLight: "bg-sky-50 border-sky-200",
  },
  growth: {
    icon: Rocket,
    accent: "text-violet-600",
    accentLight: "bg-violet-50 border-violet-200",
  },
};

interface LayerInputProps {
  layer: LayerDefinition;
  hypothesis: string;
  confidence: number;
  notes?: string;
  onHypothesisChange: (value: string) => void;
  onConfidenceChange: (value: number) => void;
  onNotesChange: (value: string) => void;
}

export function LayerInput({
  layer,
  hypothesis,
  confidence,
  notes = "",
  onHypothesisChange,
  onConfidenceChange,
  onNotesChange,
}: LayerInputProps) {
  const [showNotes, setShowNotes] = useState(false);
  const config = LAYER_CONFIG[layer.id];
  const Icon = config.icon;

  return (
    <div className="group">
      {/* Layer card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100">
          <div
            className={`w-8 h-8 rounded-xl ${config.accentLight} border flex items-center justify-center`}
          >
            <Icon className={`w-4 h-4 ${config.accent}`} />
          </div>
          <h3 className="font-semibold text-stone-800 tracking-tight">
            {layer.name}
          </h3>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Hypothesis input */}
          <textarea
            value={hypothesis}
            onChange={(e) => onHypothesisChange(e.target.value)}
            placeholder={layer.placeholder}
            className="w-full min-h-[72px] text-sm text-stone-700 placeholder:text-stone-400 bg-transparent resize-none focus:outline-none leading-relaxed"
            rows={2}
          />

          {/* Footer row */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <ConfidenceSlider
              value={confidence}
              onChange={onConfidenceChange}
              color={layer.color}
            />

            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showNotes ? (
                <Minus className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Notes</span>
            </button>
          </div>

          {/* Notes section */}
          {showNotes && (
            <div className="pt-3 border-t border-stone-100">
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Add evidence, links, or supporting thoughts..."
                className="w-full min-h-[60px] text-sm text-stone-600 placeholder:text-stone-400 bg-stone-50/50 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-stone-200 leading-relaxed"
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
