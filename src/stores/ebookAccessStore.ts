import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EbookAccessState {
  hasAccess: boolean;
  justUnlocked: boolean; // Tracks if access was just granted (for showing success modal)
  grantAccess: () => void;
  revokeAccess: () => void;
  clearJustUnlocked: () => void;
}

export const useEbookAccessStore = create<EbookAccessState>()(
  persist(
    (set) => ({
      hasAccess: false,
      justUnlocked: false,
      grantAccess: () => set({ hasAccess: true, justUnlocked: true }),
      revokeAccess: () => set({ hasAccess: false, justUnlocked: false }),
      clearJustUnlocked: () => set({ justUnlocked: false }),
    }),
    {
      name: 'ebook-early-access',
      partialize: (state) => ({
        // Only persist hasAccess, not justUnlocked (that's transient)
        hasAccess: state.hasAccess,
      }),
    }
  )
);
