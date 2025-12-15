"use client";

import { useState, useCallback } from "react";

/**
 * Hook to track which stream IDs were created by this client.
 * Used by useStream to know whether to trigger the HTTP action.
 */
export function useDrivenStreams() {
  const [drivenIds, setDrivenIds] = useState<Set<string>>(new Set());

  const markDriven = useCallback((streamId: string) => {
    setDrivenIds((prev) => new Set(prev).add(streamId));
  }, []);

  const isDriven = useCallback(
    (streamId: string) => {
      return drivenIds.has(streamId);
    },
    [drivenIds]
  );

  return { markDriven, isDriven };
}
