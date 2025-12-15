"use client";

import { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Sparkles, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export interface StartupProfile {
  description: string;
}

interface StartupProfileFormProps {
  canvasId: Id<"canvases">;
  initialProfile: StartupProfile | null;
  onGenerateCanvas: () => void;
}

const PLACEHOLDER = `Describe your startup in your own words. For example:

"We're building an app that helps busy parents find last-minute babysitters in their neighborhood. Right now we're talking to parents at local schools and have a waitlist of 200 families. Our main challenge is figuring out how to verify sitters quickly."

Or keep it simple:

"Airbnb for parking spots"

The more detail you provide, the better hypotheses we can generate for your Pivot Canvas.`;

const EXAMPLE_PROMPTS = [
  "We help [who] solve [what problem] by [how]",
  "It's like [known company] but for [different market]",
  "We've talked to X customers who told us Y",
];

export function StartupProfileForm({
  canvasId,
  initialProfile,
  onGenerateCanvas,
}: StartupProfileFormProps) {
  const [description, setDescription] = useState(
    initialProfile?.description || ""
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useMutation(api.canvases.updateProfile);
  const generateFromProfile = useAction(api.canvases.generateFromProfile);

  // Sync initial profile when it changes
  useEffect(() => {
    if (initialProfile?.description) {
      setDescription(initialProfile.description);
    }
  }, [initialProfile?.description]);

  // Debounced save
  const debouncedSave = useDebouncedCallback(async (text: string) => {
    try {
      await updateProfile({ canvasId, profile: { description: text } });
    } catch (err) {
      console.error("Failed to save:", err);
    }
  }, 500);

  const handleChange = (value: string) => {
    setDescription(value);
    debouncedSave(value);
  };

  const handleGenerate = async () => {
    if (description.trim().length < 20) {
      setError("Please write at least a few sentences about your startup");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Save first
      await updateProfile({ canvasId, profile: { description } });
      // Generate
      await generateFromProfile({ canvasId });
      // Switch tab
      onGenerateCanvas();
    } catch (err) {
      console.error("Failed to generate:", err);
      setError(err instanceof Error ? err.message : "Failed to generate canvas");
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = description.trim().length >= 20;

  return (
    <div className="space-y-6">
      {/* Main textarea */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <label className="block text-sm font-medium text-stone-700 mb-3">
          Tell us about your startup
        </label>
        <textarea
          value={description}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={12}
          className="w-full px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-shadow"
        />

        {/* Prompt hints */}
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <span
              key={i}
              className="text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded-lg"
            >
              {prompt}
            </span>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating your Pivot Canvas...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Pivot Canvas
          </>
        )}
      </button>

      {!canGenerate && (
        <p className="text-xs text-stone-400 text-center">
          Write at least a few sentences to generate
        </p>
      )}
    </div>
  );
}
