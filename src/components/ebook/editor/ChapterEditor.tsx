'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id, Doc } from '../../../../convex/_generated/dataModel';
import { EditModeHeader } from './EditModeHeader';
import { BlockList } from './BlockList';
import { motion, AnimatePresence } from 'framer-motion';

// Types for the editor
export type BlockType = Doc<'ebookBlocks'>['type'];

export interface EditableBlock {
  _id: Id<'ebookBlocks'>;
  type: BlockType;
  content: string;
  figureId?: Id<'ebookFigures'>;
  listType?: 'bullet' | 'numbered';
  order: number;
  // Track local changes
  isDirty?: boolean;
}

export interface EditorFigure {
  _id: Id<'ebookFigures'>;
  figureId: string;
  storageId: Id<'_storage'>;
  alt: string;
  caption?: string;
  url: string | null;
  // Generation metadata
  prompt?: string;
  enhancedPrompt?: string;
  style?: string;
  width?: number;
  height?: number;
}

interface ChapterEditorProps {
  draftId: Id<'ebookDrafts'>;
  chapter: Doc<'ebookChapters'>;
  blocks: Doc<'ebookBlocks'>[];
  figures: (Doc<'ebookFigures'> & { url: string | null })[];
  slug: string;
}

export function ChapterEditor({
  draftId,
  chapter,
  blocks: initialBlocks,
  figures,
  slug,
}: ChapterEditorProps) {
  const router = useRouter();

  // Local state for editing
  const [blocks, setBlocks] = useState<EditableBlock[]>(() =>
    initialBlocks.map((b) => ({ ...b, isDirty: false }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Track which blocks have been modified
  const dirtyBlockIds = useRef<Set<string>>(new Set());
  const deletedBlockIds = useRef<Set<string>>(new Set());
  const newBlockIds = useRef<Set<string>>(new Set());

  // Mutations
  const batchEditBlocks = useMutation(api.ebook.mutations.batchEditBlocks);
  const insertBlock = useMutation(api.ebook.mutations.insertBlock);
  const deleteBlock = useMutation(api.ebook.mutations.deleteBlock);
  const updateBlock = useMutation(api.ebook.mutations.updateBlock);
  const moveBlock = useMutation(api.ebook.mutations.moveBlock);

  // Track figures locally for updates
  const [localFigures, setLocalFigures] = useState<EditorFigure[]>(() =>
    figures.map((f) => ({ ...f }))
  );

  // Create figure map for easy lookup
  const figureMap = new Map<string, EditorFigure>();
  for (const fig of localFigures) {
    figureMap.set(fig._id, fig);
  }

  // Handle figure created for a block
  const handleFigureCreated = useCallback(
    (blockId: Id<'ebookBlocks'>, figureId: Id<'ebookFigures'>) => {
      // Update the block's figureId
      setBlocks((prev) =>
        prev.map((b) => (b._id === blockId ? { ...b, figureId } : b))
      );
      setHasUnsavedChanges(true);
    },
    []
  );

  // Handle figure updated
  const handleFigureUpdated = useCallback((updatedFigure: EditorFigure) => {
    setLocalFigures((prev) =>
      prev.some((f) => f._id === updatedFigure._id)
        ? prev.map((f) => (f._id === updatedFigure._id ? updatedFigure : f))
        : [...prev, updatedFigure]
    );
  }, []);

  // Update block content
  const handleBlockChange = useCallback(
    (blockId: Id<'ebookBlocks'>, content: string) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b._id === blockId ? { ...b, content, isDirty: true } : b
        )
      );
      dirtyBlockIds.current.add(blockId);
      setHasUnsavedChanges(true);
    },
    []
  );

  // Delete a block
  const handleDeleteBlock = useCallback((blockId: Id<'ebookBlocks'>) => {
    setBlocks((prev) => prev.filter((b) => b._id !== blockId));
    deletedBlockIds.current.add(blockId);
    // Remove from dirty if it was there
    dirtyBlockIds.current.delete(blockId);
    setHasUnsavedChanges(true);
  }, []);

  // Insert a new block after another
  const handleInsertBlock = useCallback(
    async (afterBlockId: Id<'ebookBlocks'> | null, type: BlockType) => {
      // Create the block immediately in the database
      const newBlockId = await insertBlock({
        chapterId: chapter._id,
        type,
        content: '',
        afterBlockId: afterBlockId ?? undefined,
      });

      // Add to local state
      setBlocks((prev) => {
        if (!afterBlockId) {
          // Insert at the beginning
          const firstBlock = prev[0];
          const newOrder = firstBlock ? firstBlock.order - 1 : 0;
          return [
            {
              _id: newBlockId,
              type,
              content: '',
              figureId: undefined,
              listType: type === 'list' ? 'bullet' : undefined,
              order: newOrder,
              isDirty: false,
            },
            ...prev,
          ];
        }

        const afterIndex = prev.findIndex((b) => b._id === afterBlockId);
        if (afterIndex === -1) return prev;

        const afterBlock = prev[afterIndex];
        const nextBlock = prev[afterIndex + 1];
        const newOrder = nextBlock
          ? (afterBlock.order + nextBlock.order) / 2
          : afterBlock.order + 1;

        const newBlock: EditableBlock = {
          _id: newBlockId,
          type,
          content: '',
          figureId: undefined,
          listType: type === 'list' ? 'bullet' : undefined,
          order: newOrder,
          isDirty: false,
        };

        return [
          ...prev.slice(0, afterIndex + 1),
          newBlock,
          ...prev.slice(afterIndex + 1),
        ];
      });

      newBlockIds.current.add(newBlockId);
      setHasUnsavedChanges(true);
      return newBlockId;
    },
    [chapter._id, insertBlock]
  );

  // Reorder blocks (for drag and drop)
  const handleMoveBlock = useCallback(
    (blockId: Id<'ebookBlocks'>, afterBlockId: Id<'ebookBlocks'> | null) => {
      setBlocks((prev) => {
        const blockIndex = prev.findIndex((b) => b._id === blockId);
        if (blockIndex === -1) return prev;

        const block = prev[blockIndex];
        const newBlocks = prev.filter((b) => b._id !== blockId);

        if (!afterBlockId) {
          // Move to beginning
          const firstBlock = newBlocks[0];
          const newOrder = firstBlock ? firstBlock.order - 1 : 0;
          return [{ ...block, order: newOrder, isDirty: true }, ...newBlocks];
        }

        const afterIndex = newBlocks.findIndex((b) => b._id === afterBlockId);
        if (afterIndex === -1) return prev;

        const afterBlock = newBlocks[afterIndex];
        const nextBlock = newBlocks[afterIndex + 1];
        const newOrder = nextBlock
          ? (afterBlock.order + nextBlock.order) / 2
          : afterBlock.order + 1;

        return [
          ...newBlocks.slice(0, afterIndex + 1),
          { ...block, order: newOrder, isDirty: true },
          ...newBlocks.slice(afterIndex + 1),
        ];
      });

      dirtyBlockIds.current.add(blockId);
      setHasUnsavedChanges(true);
    },
    []
  );

  // Save all changes
  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Build operations for batch edit
      const operations: Parameters<typeof batchEditBlocks>[0]['operations'] =
        [];

      // Updates for dirty blocks (excluding new blocks since they're already saved)
      for (const block of blocks) {
        if (
          dirtyBlockIds.current.has(block._id) &&
          !newBlockIds.current.has(block._id)
        ) {
          operations.push({
            op: 'update',
            blockId: block._id,
            content: block.content,
          });
        }
      }

      // Deletes
      for (const blockId of deletedBlockIds.current) {
        // Skip if it was a new block that was deleted
        if (!newBlockIds.current.has(blockId as Id<'ebookBlocks'>)) {
          operations.push({
            op: 'delete',
            blockId: blockId as Id<'ebookBlocks'>,
          });
        }
      }

      // Execute batch operation if there are any
      if (operations.length > 0) {
        await batchEditBlocks({ operations });
      }

      // Clear tracking
      dirtyBlockIds.current.clear();
      deletedBlockIds.current.clear();
      newBlockIds.current.clear();
      setHasUnsavedChanges(false);

      // Update local blocks to mark as clean
      setBlocks((prev) => prev.map((b) => ({ ...b, isDirty: false })));
    } catch (err) {
      console.error('Failed to save:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, blocks, batchEditBlocks]);

  // Exit edit mode
  const handleExit = useCallback(async () => {
    if (hasUnsavedChanges) {
      // Save before exiting
      await handleSave();
    }
    router.push(`/ebook/${slug}`);
  }, [hasUnsavedChanges, handleSave, router, slug]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S or Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Escape to exit (with confirmation if unsaved)
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          if (confirm('You have unsaved changes. Save before leaving?')) {
            handleSave().then(() => router.push(`/ebook/${slug}`));
          } else if (confirm('Discard changes and exit?')) {
            router.push(`/ebook/${slug}`);
          }
        } else {
          router.push(`/ebook/${slug}`);
        }
      }

      // Cmd+Enter to save and exit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave().then(() => router.push(`/ebook/${slug}`));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, hasUnsavedChanges, router, slug]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Compute title
  const title =
    chapter.type === 'chapter' && chapter.chapterNumber
      ? `Chapter ${chapter.chapterNumber}: ${chapter.title}`
      : chapter.title;

  return (
    <div className="min-h-screen bg-white">
      <EditModeHeader
        title={title}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={handleSave}
        onExit={handleExit}
        slug={slug}
      />

      {/* Error banner */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 px-4 py-2 bg-red-500 text-white text-center text-sm"
          >
            {saveError}
            <button
              onClick={() => setSaveError(null)}
              className="ml-4 underline hover:no-underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor content - full width with gutter for controls on left */}
      <main className="pt-20 pb-32">
        <div className="max-w-4xl mx-auto pl-12 pr-6">
          <BlockList
            blocks={blocks}
            figureMap={figureMap}
            draftId={draftId}
            onBlockChange={handleBlockChange}
            onDeleteBlock={handleDeleteBlock}
            onInsertBlock={handleInsertBlock}
            onMoveBlock={handleMoveBlock}
            onFigureCreated={handleFigureCreated}
            onFigureUpdated={handleFigureUpdated}
            chapterId={chapter._id}
          />
        </div>
      </main>
    </div>
  );
}
