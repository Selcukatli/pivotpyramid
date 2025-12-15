"use client";

import { useCanvas } from "./canvas-provider";
import { LayerInput } from "./layer-input";
import { PIVOT_PYRAMID_LAYERS, type LayerId } from "@/lib/pivot-pyramid-data";

export function CanvasForm() {
  const { layers, updateLayer, isLoading } = useCanvas();

  if (isLoading) {
    return (
      <div className="space-y-5">
        {PIVOT_PYRAMID_LAYERS.map((layer) => (
          <div
            key={layer.id}
            className="rounded-2xl border border-stone-200 bg-white p-5 animate-pulse"
          >
            <div className="h-5 w-28 bg-stone-100 rounded-lg mb-4" />
            <div className="h-16 bg-stone-100 rounded-xl mb-4" />
            <div className="h-8 bg-stone-100 rounded-lg w-48" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Layer inputs */}
      {PIVOT_PYRAMID_LAYERS.map((layer) => (
        <LayerInput
          key={layer.id}
          layer={layer}
          hypothesis={layers[layer.id].hypothesis}
          confidence={layers[layer.id].confidence}
          notes={layers[layer.id].notes}
          onHypothesisChange={(value) =>
            updateLayer(layer.id as LayerId, { hypothesis: value })
          }
          onConfidenceChange={(value) =>
            updateLayer(layer.id as LayerId, { confidence: value })
          }
          onNotesChange={(value) =>
            updateLayer(layer.id as LayerId, { notes: value })
          }
        />
      ))}
    </div>
  );
}
