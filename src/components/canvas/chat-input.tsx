"use client";

import { useState, useRef } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading,
  placeholder = "Ask about your canvas...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={1}
        className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 pr-12 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
      />
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="absolute right-2 bottom-2 p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowUp className="w-4 h-4" />
        )}
      </button>
    </form>
  );
}
