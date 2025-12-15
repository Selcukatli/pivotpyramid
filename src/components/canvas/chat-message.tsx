"use client";

import { useEffect, useRef } from "react";
import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { StreamId } from "@convex-dev/persistent-text-streaming";
import { api } from "../../../convex/_generated/api";
import { Sparkles } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  streamId?: string;
  isDriven: boolean;
  convexSiteUrl: string;
  onStreamComplete?: (content: string) => void;
  onPendingChange?: (isPending: boolean) => void;
}

export function ChatMessage({
  role,
  content,
  streamId,
  isDriven,
  convexSiteUrl,
  onStreamComplete,
  onPendingChange,
}: ChatMessageProps) {
  // For assistant messages with streamId, use streaming
  const shouldStream = role === "assistant" && streamId;

  const { text, status } = useStream(
    api.canvasMessages.getStreamBody,
    new URL(`${convexSiteUrl}/canvas-stream`),
    shouldStream ? isDriven : false,
    (streamId || "") as StreamId
  );

  // Determine display content
  const displayContent = shouldStream ? text || content : content;
  const isStreaming = shouldStream && status === "streaming";
  const isPending =
    shouldStream && (status === "pending" || (status === "streaming" && !text));

  // Track previous pending state to avoid unnecessary calls
  const prevPendingRef = useRef<boolean | null>(null);

  // Notify parent of pending status changes - only when value actually changes
  useEffect(() => {
    const currentPending = !!isPending;
    if (onPendingChange && prevPendingRef.current !== currentPending) {
      prevPendingRef.current = currentPending;
      onPendingChange(currentPending);
    }
  }, [isPending, onPendingChange]);

  // Notify when stream completes
  useEffect(() => {
    if (shouldStream && status === "done" && text && onStreamComplete) {
      onStreamComplete(text);
    }
  }, [shouldStream, status, text, onStreamComplete]);

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-stone-800 text-white px-4 py-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 max-w-[calc(100%-40px)]">
        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-stone-400 py-2">
            <span className="flex gap-1">
              <span
                className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </span>
            <span>Thinking...</span>
          </div>
        ) : (
          <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
            {displayContent}
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-amber-500 ml-0.5 animate-pulse rounded-full" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
