import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EbookAccessState {
  hasAccess: boolean;
  grantAccess: () => void;
  revokeAccess: () => void;
}

export const useEbookAccessStore = create<EbookAccessState>()(
  persist(
    (set) => ({
      hasAccess: false,
      grantAccess: () => set({ hasAccess: true }),
      revokeAccess: () => set({ hasAccess: false }),
    }),
    {
      name: 'ebook-early-access',
    }
  )
);
