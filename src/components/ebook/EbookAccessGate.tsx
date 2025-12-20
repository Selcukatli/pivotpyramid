'use client';

import { useState, useEffect } from 'react';
import { useEbookAccessStore } from '@/stores/ebookAccessStore';
import { AccessModal } from './AccessModal';
import { UnlockSuccessModal } from './UnlockSuccessModal';
import { BookOpen, Lock } from 'lucide-react';

interface EbookAccessGateProps {
  children: React.ReactNode;
}

export function EbookAccessGate({ children }: EbookAccessGateProps) {
  const hasAccess = useEbookAccessStore((state) => state.hasAccess);
  const justUnlocked = useEbookAccessStore((state) => state.justUnlocked);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration to avoid mismatch between server and client
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show modal automatically when accessing without access
  useEffect(() => {
    if (isHydrated && !hasAccess) {
      setIsModalOpen(true);
    }
  }, [isHydrated, hasAccess]);

  // Show success modal when access was just unlocked
  useEffect(() => {
    if (isHydrated && justUnlocked) {
      setIsSuccessModalOpen(true);
    }
  }, [isHydrated, justUnlocked]);

  // During SSR or before hydration, show a loading state
  if (!isHydrated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-stone-400">Loading...</div>
      </div>
    );
  }

  // If user has access, show the content (and possibly the success modal)
  if (hasAccess) {
    return (
      <>
        {children}
        <UnlockSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      </>
    );
  }

  // User doesn't have access - show blurred preview + overlay
  return (
    <>
      <div className="relative">
        {/* Blurred preview of content */}
        <div className="blur-lg pointer-events-none select-none opacity-50 max-h-[60vh] overflow-hidden">
          {children}
        </div>

        {/* Gradient fade at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />

        {/* Locked content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
              <Lock className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-3">
              Early Access Content
            </h2>
            <p className="text-stone-600 mb-6">
              This chapter is available for early access readers.
              Join the waitlist or enter your password to continue reading.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              <BookOpen className="w-5 h-5" />
              Unlock Chapter
            </button>
          </div>
        </div>
      </div>

      <AccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
