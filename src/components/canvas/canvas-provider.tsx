"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { LayerId } from "@/lib/pivot-pyramid-data";

// Layer data type
interface LayerData {
  hypothesis: string;
  confidence: number;
  notes?: string;
}

// All layers
interface CanvasLayers {
  customers: LayerData;
  problem: LayerData;
  solution: LayerData;
  technology: LayerData;
  growth: LayerData;
}

// Startup profile type
export interface StartupProfile {
  description: string;
}

// Canvas context type
interface CanvasContextType {
  canvasId: Id<"canvases"> | null;
  name: string;
  layers: CanvasLayers;
  startupProfile: StartupProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  updateLayer: (layerId: LayerId, data: Partial<LayerData>) => void;
  updateName: (name: string) => void;
}

// Default layer values
const defaultLayer: LayerData = {
  hypothesis: "",
  confidence: 50,
  notes: "",
};

const defaultLayers: CanvasLayers = {
  customers: { ...defaultLayer },
  problem: { ...defaultLayer },
  solution: { ...defaultLayer },
  technology: { ...defaultLayer },
  growth: { ...defaultLayer },
};

// Create context
const CanvasContext = createContext<CanvasContextType | null>(null);

// Provider component
export function CanvasProvider({
  sessionId,
  children,
}: {
  sessionId: string;
  children: React.ReactNode;
}) {
  // Convex operations
  const getOrCreate = useMutation(api.canvases.getOrCreate);
  const updateLayersMutation = useMutation(api.canvases.updateLayers);
  const updateNameMutation = useMutation(api.canvases.updateName);

  // Local state for optimistic updates
  const canvasIdRef = useRef<Id<"canvases"> | null>(null);
  const savingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingLayersRef = useRef<CanvasLayers | null>(null);
  const lastSavedRef = useRef<Date | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (sessionId && !canvasIdRef.current) {
      getOrCreate({ sessionId }).then((id) => {
        canvasIdRef.current = id;
      });
    }
  }, [sessionId, getOrCreate]);

  // Query canvas data
  const canvas = useQuery(
    api.canvases.getBySession,
    sessionId ? { sessionId } : "skip"
  );

  // Update canvasId ref when canvas loads
  useEffect(() => {
    if (canvas?._id) {
      canvasIdRef.current = canvas._id;
    }
  }, [canvas?._id]);

  // Debounced save function
  const saveLayersDebounced = useCallback(
    (layers: CanvasLayers) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      pendingLayersRef.current = layers;

      debounceRef.current = setTimeout(async () => {
        const canvasId = canvasIdRef.current;
        const layersToSave = pendingLayersRef.current;

        if (!canvasId || !layersToSave || savingRef.current) return;

        savingRef.current = true;
        try {
          await updateLayersMutation({ canvasId, layers: layersToSave });
          lastSavedRef.current = new Date();
        } finally {
          savingRef.current = false;
          pendingLayersRef.current = null;
        }
      }, 500);
    },
    [updateLayersMutation]
  );

  // Update a single layer
  const updateLayer = useCallback(
    (layerId: LayerId, data: Partial<LayerData>) => {
      if (!canvas) return;

      const currentLayers = pendingLayersRef.current || canvas.layers;
      const updatedLayers = {
        ...currentLayers,
        [layerId]: {
          ...currentLayers[layerId],
          ...data,
        },
      };

      saveLayersDebounced(updatedLayers);
    },
    [canvas, saveLayersDebounced]
  );

  // Update canvas name
  const updateName = useCallback(
    async (name: string) => {
      const canvasId = canvasIdRef.current;
      if (!canvasId) return;

      await updateNameMutation({ canvasId, name });
    },
    [updateNameMutation]
  );

  // Context value
  const value = useMemo<CanvasContextType>(
    () => ({
      canvasId: canvas?._id ?? null,
      name: canvas?.name ?? "My Startup Canvas",
      layers: pendingLayersRef.current || canvas?.layers || defaultLayers,
      startupProfile: canvas?.startupProfile ?? null,
      isLoading: canvas === undefined,
      isSaving: savingRef.current,
      lastSaved: lastSavedRef.current,
      updateLayer,
      updateName,
    }),
    [canvas, updateLayer, updateName]
  );

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

// Hook to use canvas context
export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}
