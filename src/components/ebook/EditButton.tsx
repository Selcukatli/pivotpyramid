'use client';

import { useQuery, useConvexAuth } from 'convex/react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { api } from '../../../convex/_generated/api';
import Link from 'next/link';
import { Edit3, LogIn } from 'lucide-react';

interface EditButtonProps {
  slug: string;
}

export function EditButton({ slug }: EditButtonProps) {
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { isAuthenticated: convexAuthenticated } = useConvexAuth();

  // Only check permission when authenticated
  const canEdit = useQuery(
    api.ebook.queries.canEditPublishedDraft,
    clerkLoaded && isSignedIn && convexAuthenticated ? {} : 'skip'
  );

  // Still loading
  if (!clerkLoaded) {
    return null;
  }

  // Not signed in - show login button
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
          <LogIn className="w-4 h-4" />
          <span>Login</span>
        </button>
      </SignInButton>
    );
  }

  // Signed in but can't edit (or still checking permissions)
  if (!convexAuthenticated || !canEdit) {
    return null;
  }

  // Can edit - show edit button
  return (
    <Link
      href={`/ebook/${slug}/edit`}
      className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
    >
      <Edit3 className="w-4 h-4" />
      <span>Edit</span>
    </Link>
  );
}
