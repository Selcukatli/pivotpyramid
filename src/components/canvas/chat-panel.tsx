"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCanvas } from "./canvas-provider";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { MessageSquare, Trash2, Sparkles } from "lucide-react";

interface ChatPanelProps {
  markDriven: (streamId: string) => void;
  isDriven: (streamId: string) => boolean;
}

// Suggested prompts for empty state
const SUGGESTED_PROMPTS = [
  "Analyze my canvas and identify the weakest layer",
  "What should I validate first?",
  "Are there any contradictions in my assumptions?",
  "What happens if I pivot my customer segment?",
];

export function ChatPanel({ markDriven, isDriven }: ChatPanelProps) {
  const { canvasId } = useCanvas();
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(
    new Set()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convex queries and mutations
  const messages = useQuery(
    api.canvasMessages.listByCanvas,
    canvasId ? { canvasId } : "skip"
  );
  const createUserMessage = useMutation(api.canvasMessages.createUserMessage);
  const createAssistantMessage = useMutation(
    api.canvasMessages.createAssistantMessage
  );
  const clearMessages = useMutation(api.canvasMessages.clearMessages);

  // Get Convex site URL for HTTP actions
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
  const convexSiteUrl = convexUrl.replace(".cloud", ".site");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if any message is currently pending
  const isAnyPending = pendingMessages.size > 0;

  // Handle pending status changes from message components
  const handlePendingChange = useCallback(
    (messageId: string, isPending: boolean) => {
      setPendingMessages((prev) => {
        const newSet = new Set(prev);
        if (isPending) {
          newSet.add(messageId);
        } else {
          newSet.delete(messageId);
        }
        return newSet;
      });
    },
    []
  );

  // Send a message
  const handleSendMessage = async (content: string) => {
    if (!canvasId) return;

    // Create user message
    await createUserMessage({ canvasId, content });

    // Create assistant message (starts streaming)
    const { streamId } = await createAssistantMessage({
      canvasId,
      userMessage: content,
    });

    // Mark this stream as driven by this client
    markDriven(streamId as string);
  };

  // Clear chat history
  const handleClearChat = async () => {
    if (!canvasId) return;
    if (confirm("Clear all chat messages?")) {
      await clearMessages({ canvasId });
    }
  };

  // Handle suggested prompt click
  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-semibold text-stone-800 tracking-tight">
            AI Advisor
          </h3>
        </div>
        {hasMessages && (
          <button
            onClick={handleClearChat}
            className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {!hasMessages ? (
          // Empty state
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
              <MessageSquare className="w-6 h-6 text-stone-400" />
            </div>
            <h4 className="font-semibold text-stone-800 mb-2">
              Get AI guidance on your canvas
            </h4>
            <p className="text-sm text-stone-500 mb-6 max-w-[280px] leading-relaxed">
              Ask questions about your assumptions, get feedback on weak areas,
              or explore pivot scenarios.
            </p>
            <div className="space-y-2.5 w-full max-w-[300px]">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="w-full text-left text-sm px-4 py-3 rounded-xl border border-stone-200 text-stone-600 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-700 transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Message list
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message._id}
                role={message.role}
                content={message.content}
                streamId={message.streamId}
                isDriven={message.streamId ? isDriven(message.streamId) : false}
                convexSiteUrl={convexSiteUrl}
                onPendingChange={(isPending) =>
                  handlePendingChange(message._id, isPending)
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isAnyPending}
          placeholder={
            hasMessages
              ? "Ask a follow-up question..."
              : "Ask about your canvas..."
          }
        />
      </div>
    </div>
  );
}
