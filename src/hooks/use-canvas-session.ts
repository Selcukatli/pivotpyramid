"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "pivot-canvas-session";

/**
 * Hook to manage anonymous canvas session ID.
 * Generates a UUID on first visit and stores it in localStorage.
 */
export function useCanvasSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    let id = localStorage.getItem(STORAGE_KEY);

    if (!id) {
      // Generate new session ID
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }

    setSessionId(id);
    setIsLoading(false);
  }, []);

  return { sessionId, isLoading };
}
