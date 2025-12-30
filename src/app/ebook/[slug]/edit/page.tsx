'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useConvexAuth } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { api } from '../../../../../convex/_generated/api';
import { ChapterEditor } from '@/components/ebook/editor/ChapterEditor';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function EditChapterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Auth states
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { isAuthenticated: convexAuthenticated } = useConvexAuth();

  // Get the published draft
  const publishedDraft = useQuery(api.ebook.queries.getPublishedDraft, {});

  // Check if user can edit (only query when we have a draft)
  const canEdit = useQuery(
    api.ebook.queries.canEditPublishedDraft,
    publishedDraft ? {} : 'skip'
  );

  // Get chapter with blocks for editing
  const chapterData = useQuery(
    api.ebook.queries.getChapterWithBlocks,
    publishedDraft ? { draftId: publishedDraft._id, slug } : 'skip'
  );

  // Loading state - waiting for auth and data
  const isLoading =
    !clerkLoaded ||
    publishedDraft === undefined ||
    canEdit === undefined ||
    chapterData === undefined;

  // Not signed in
  if (clerkLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Sign In Required
          </h1>
          <p className="text-stone-600 mb-6">
            You need to be signed in to edit this chapter.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={`/ebook/${slug}`}
              className="block w-full px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors"
            >
              Back to Reading
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading - show skeleton that matches the editor layout
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        {/* Header skeleton */}
        <div className="sticky top-0 z-30 bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-stone-200 rounded animate-pulse" />
              <div className="h-5 w-48 bg-stone-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-16 bg-stone-200 rounded-lg animate-pulse" />
              <div className="h-9 w-16 bg-stone-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Part label skeleton */}
            <div className="h-4 w-32 bg-amber-100 rounded animate-pulse" />

            {/* Title skeleton */}
            <div className="h-10 w-3/4 bg-stone-200 rounded animate-pulse" />

            {/* Paragraph skeletons */}
            <div className="space-y-3 pt-4">
              <div className="h-5 w-full bg-stone-100 rounded animate-pulse" />
              <div className="h-5 w-full bg-stone-100 rounded animate-pulse" />
              <div className="h-5 w-4/5 bg-stone-100 rounded animate-pulse" />
            </div>

            <div className="space-y-3 pt-2">
              <div className="h-5 w-full bg-stone-100 rounded animate-pulse" />
              <div className="h-5 w-full bg-stone-100 rounded animate-pulse" />
              <div className="h-5 w-3/5 bg-stone-100 rounded animate-pulse" />
            </div>

            {/* Heading skeleton */}
            <div className="h-7 w-1/2 bg-stone-200 rounded animate-pulse mt-8" />

            {/* More paragraph skeletons */}
            <div className="space-y-3 pt-2">
              <div className="h-5 w-full bg-stone-100 rounded animate-pulse" />
              <div className="h-5 w-full bg-stone-100 rounded animate-pulse" />
              <div className="h-5 w-2/3 bg-stone-100 rounded animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // No draft found
  if (!publishedDraft) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            No Ebook Found
          </h1>
          <p className="text-stone-600 mb-6">
            There is no published ebook to edit.
          </p>
          <Link
            href="/ebook"
            className="inline-flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Ebook
          </Link>
        </motion.div>
      </div>
    );
  }

  // No permission to edit
  if (!canEdit) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Access Denied
          </h1>
          <p className="text-stone-600 mb-6">
            You don&apos;t have permission to edit this ebook. Only admins and
            the ebook owner can make changes.
          </p>
          <Link
            href={`/ebook/${slug}`}
            className="inline-flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reading
          </Link>
        </motion.div>
      </div>
    );
  }

  // Chapter not found
  if (!chapterData) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Chapter Not Found
          </h1>
          <p className="text-stone-600 mb-6">
            The chapter &quot;{slug}&quot; could not be found.
          </p>
          <Link
            href="/ebook"
            className="inline-flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Ebook
          </Link>
        </motion.div>
      </div>
    );
  }

  // Render the editor
  return (
    <ChapterEditor
      draftId={publishedDraft._id}
      chapter={chapterData.chapter}
      blocks={chapterData.blocks}
      figures={chapterData.figures}
      slug={slug}
    />
  );
}
