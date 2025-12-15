"use client";

import { useState } from "react";
import { useCanvasSession } from "@/hooks/use-canvas-session";
import { useDrivenStreams } from "@/hooks/use-driven-streams";
import { CanvasProvider, useCanvas } from "@/components/canvas/canvas-provider";
import { CanvasHeader } from "@/components/canvas/canvas-header";
import { CanvasForm } from "@/components/canvas/canvas-form";
import { ChatPanel } from "@/components/canvas/chat-panel";
import { CanvasTabs, type CanvasTab } from "@/components/canvas/canvas-tabs";
import { StartupProfileForm } from "@/components/canvas/startup-profile-form";
import { Loader2 } from "lucide-react";

function LoadingState() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-3" />
        <p className="text-sm text-stone-500">Loading your canvas...</p>
      </div>
    </div>
  );
}

function CanvasContent() {
  const { markDriven, isDriven } = useDrivenStreams();
  const { canvasId, startupProfile } = useCanvas();
  const [activeTab, setActiveTab] = useState<CanvasTab>(
    startupProfile ? "canvas" : "profile"
  );

  const handleGenerateCanvas = () => {
    setActiveTab("canvas");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <CanvasHeader />

      {/* Desktop: Fixed chat panel on right */}
      <div className="hidden lg:block fixed top-[73px] right-0 w-[38%] h-[calc(100vh-73px)] p-6 pr-8">
        <ChatPanel markDriven={markDriven} isDriven={isDriven} />
      </div>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:pr-[40%]">
        {/* Tabs */}
        <div className="flex justify-center lg:justify-start mb-6">
          <CanvasTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasProfile={!!startupProfile}
          />
        </div>

        {/* Subtitle - changes based on active tab */}
        <p className="text-center lg:text-left text-sm text-stone-500 mb-8">
          {activeTab === "profile" ? (
            <>
              Describe your startup and{" "}
              <span className="text-amber-600 font-medium">
                generate a canvas
              </span>
            </>
          ) : (
            <>
              Document your startup hypotheses from{" "}
              <span className="text-amber-600 font-medium">Customers</span> to{" "}
              <span className="text-violet-600 font-medium">Growth</span>
            </>
          )}
        </p>

        {/* Mobile: Chat panel inline (only show on canvas tab) */}
        {activeTab === "canvas" && (
          <div className="lg:hidden mb-8 h-[400px]">
            <ChatPanel markDriven={markDriven} isDriven={isDriven} />
          </div>
        )}

        {/* Tab content */}
        {activeTab === "profile" ? (
          canvasId && (
            <StartupProfileForm
              canvasId={canvasId}
              initialProfile={startupProfile}
              onGenerateCanvas={handleGenerateCanvas}
            />
          )
        ) : (
          <CanvasForm />
        )}

        {/* Footer */}
        <div className="mt-16 text-center lg:text-left">
          <p className="text-xs text-stone-400">Auto-saves as you type</p>
        </div>
      </main>
    </div>
  );
}

export default function CanvasPage() {
  const { sessionId, isLoading } = useCanvasSession();

  if (isLoading || !sessionId) {
    return <LoadingState />;
  }

  return (
    <CanvasProvider sessionId={sessionId}>
      <CanvasContent />
    </CanvasProvider>
  );
}
