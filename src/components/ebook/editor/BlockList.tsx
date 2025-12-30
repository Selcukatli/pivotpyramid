'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Id } from '../../../../convex/_generated/dataModel';
import { EditableBlock, type BlockType, type EditorFigure } from './ChapterEditor';
import { SortableBlock } from './SortableBlock';
import { SlashCommandMenu } from './SlashCommandMenu';

interface BlockListProps {
  blocks: EditableBlock[];
  figureMap: Map<string, EditorFigure>;
  draftId: Id<'ebookDrafts'>;
  onBlockChange: (blockId: Id<'ebookBlocks'>, content: string) => void;
  onDeleteBlock: (blockId: Id<'ebookBlocks'>) => void;
  onInsertBlock: (
    afterBlockId: Id<'ebookBlocks'> | null,
    type: BlockType
  ) => Promise<Id<'ebookBlocks'>>;
  onMoveBlock: (
    blockId: Id<'ebookBlocks'>,
    afterBlockId: Id<'ebookBlocks'> | null
  ) => void;
  onFigureCreated: (blockId: Id<'ebookBlocks'>, figureId: Id<'ebookFigures'>) => void;
  onFigureUpdated: (figure: EditorFigure) => void;
  chapterId: Id<'ebookChapters'>;
}

export function BlockList({
  blocks,
  figureMap,
  draftId,
  onBlockChange,
  onDeleteBlock,
  onInsertBlock,
  onMoveBlock,
  onFigureCreated,
  onFigureUpdated,
  chapterId,
}: BlockListProps) {
  const emptyStateRef = useRef<HTMLDivElement>(null);
  const [slashMenuState, setSlashMenuState] = useState<{
    isOpen: boolean;
    afterBlockId: Id<'ebookBlocks'> | null;
    position: { x: number; y: number } | null;
  }>({
    isOpen: false,
    afterBlockId: null,
    position: null,
  });

  // Track which block should be focused after render
  const [pendingFocusBlockId, setPendingFocusBlockId] = useState<Id<'ebookBlocks'> | null>(null);

  // Focus the pending block after it's rendered
  useEffect(() => {
    if (pendingFocusBlockId) {
      // Small delay to ensure the block is rendered
      const timer = setTimeout(() => {
        const blockElement = document.querySelector(`[data-block-id="${pendingFocusBlockId}"]`);
        const textarea = blockElement?.querySelector('textarea');
        if (textarea) {
          textarea.focus();
          // Put cursor at the start for new blocks
          textarea.setSelectionRange(0, 0);
        }
        setPendingFocusBlockId(null);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pendingFocusBlockId]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const activeId = active.id as Id<'ebookBlocks'>;
        const overId = over.id as Id<'ebookBlocks'>;

        // Find the index of the over item
        const overIndex = blocks.findIndex((b) => b._id === overId);
        const activeIndex = blocks.findIndex((b) => b._id === activeId);

        // Determine the afterBlockId based on direction
        let afterBlockId: Id<'ebookBlocks'> | null;
        if (activeIndex < overIndex) {
          // Moving down - insert after the over item
          afterBlockId = overId;
        } else {
          // Moving up - insert before the over item (after the previous item)
          afterBlockId = overIndex > 0 ? blocks[overIndex - 1]._id : null;
        }

        onMoveBlock(activeId, afterBlockId);
      }
    },
    [blocks, onMoveBlock]
  );

  // Open slash command menu from a block (inserts after that block)
  const handleBlockOpenSlashMenu = useCallback(
    (element: HTMLElement) => {
      // Find which block this element belongs to
      const blockElement = element.closest('[data-block-id]');
      const blockId = blockElement?.getAttribute('data-block-id') as Id<'ebookBlocks'> | null;

      const rect = element.getBoundingClientRect();
      setSlashMenuState({
        isOpen: true,
        afterBlockId: blockId,
        position: { x: rect.left, y: rect.bottom + 8 },
      });
    },
    []
  );

  // Open slash command menu for empty state (inserts at beginning)
  const handleEmptyStateClick = useCallback(() => {
    if (emptyStateRef.current) {
      const rect = emptyStateRef.current.getBoundingClientRect();
      setSlashMenuState({
        isOpen: true,
        afterBlockId: null,
        position: { x: rect.left + 100, y: rect.top + 60 },
      });
    }
  }, []);

  // Close slash command menu
  const handleCloseSlashMenu = useCallback(() => {
    setSlashMenuState({
      isOpen: false,
      afterBlockId: null,
      position: null,
    });
  }, []);

  // Handle block type selection from slash menu
  const handleSelectBlockType = useCallback(
    async (type: BlockType) => {
      await onInsertBlock(slashMenuState.afterBlockId, type);
      handleCloseSlashMenu();
    },
    [slashMenuState.afterBlockId, onInsertBlock, handleCloseSlashMenu]
  );

  // Insert a new paragraph block after the given block and focus it
  const handleInsertParagraphAfter = useCallback(
    async (blockId: Id<'ebookBlocks'>) => {
      const newBlockId = await onInsertBlock(blockId, 'paragraph');
      setPendingFocusBlockId(newBlockId);
    },
    [onInsertBlock]
  );

  // Split a block at the cursor position
  const handleSplitBlock = useCallback(
    async (
      blockId: Id<'ebookBlocks'>,
      beforeContent: string,
      afterContent: string
    ) => {
      // 1. Update current block with beforeContent
      onBlockChange(blockId, beforeContent);
      // 2. Insert new paragraph after with afterContent
      const newBlockId = await onInsertBlock(blockId, 'paragraph');
      // 3. Update the new block with the afterContent
      onBlockChange(newBlockId, afterContent);
      // 4. Focus the new block
      setPendingFocusBlockId(newBlockId);
    },
    [onBlockChange, onInsertBlock]
  );

  // Duplicate a block
  const handleDuplicateBlock = useCallback(
    async (blockId: Id<'ebookBlocks'>) => {
      const block = blocks.find((b) => b._id === blockId);
      if (!block) return;
      // Insert a new block of the same type after the current one
      const newBlockId = await onInsertBlock(blockId, block.type);
      // Copy the content to the new block
      onBlockChange(newBlockId, block.content);
    },
    [blocks, onInsertBlock, onBlockChange]
  );

  // Delete empty block and focus previous block
  const handleDeleteEmptyBlock = useCallback(
    (blockId: Id<'ebookBlocks'>) => {
      const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
      const blockIndex = sortedBlocks.findIndex((b) => b._id === blockId);

      // Find the previous block to focus
      const previousBlockId = blockIndex > 0 ? sortedBlocks[blockIndex - 1]._id : null;

      // Delete the empty block
      onDeleteBlock(blockId);

      // Focus the previous block
      if (previousBlockId) {
        setPendingFocusBlockId(previousBlockId);
      }
    },
    [blocks, onDeleteBlock]
  );

  // Focus next block
  const handleFocusNext = useCallback(
    (blockId: Id<'ebookBlocks'>) => {
      const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
      const blockIndex = sortedBlocks.findIndex((b) => b._id === blockId);
      const nextBlockId = blockIndex < sortedBlocks.length - 1 ? sortedBlocks[blockIndex + 1]._id : null;
      if (nextBlockId) {
        setPendingFocusBlockId(nextBlockId);
      }
    },
    [blocks]
  );

  // Focus previous block
  const handleFocusPrevious = useCallback(
    (blockId: Id<'ebookBlocks'>) => {
      const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
      const blockIndex = sortedBlocks.findIndex((b) => b._id === blockId);
      const previousBlockId = blockIndex > 0 ? sortedBlocks[blockIndex - 1]._id : null;
      if (previousBlockId) {
        setPendingFocusBlockId(previousBlockId);
      }
    },
    [blocks]
  );

  // Open slash menu from the gap between blocks
  const handleGapPlusClick = useCallback(
    (afterBlockId: Id<'ebookBlocks'> | null, element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      setSlashMenuState({
        isOpen: true,
        afterBlockId,
        position: { x: rect.left + 20, y: rect.bottom + 4 },
      });
    },
    []
  );

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Empty state when no blocks
  if (sortedBlocks.length === 0) {
    return (
      <>
        <div
          ref={emptyStateRef}
          className="py-12 text-center"
        >
          <p className="text-stone-400 mb-4">
            This chapter is empty. Add your first block to start writing.
          </p>
          <button
            onClick={handleEmptyStateClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add first block
          </button>
        </div>

        <SlashCommandMenu
          isOpen={slashMenuState.isOpen}
          position={slashMenuState.position}
          onSelect={handleSelectBlockType}
          onClose={handleCloseSlashMenu}
        />
      </>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedBlocks.map((b) => b._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="relative">
            {/* Gap before first block with plus on left */}
            <div className="group relative h-6 -mx-3 px-3">
              <div className="absolute inset-x-3 top-1/2 h-px bg-transparent group-hover:bg-stone-200 transition-colors" />
              <button
                onClick={(e) => handleGapPlusClick(null, e.currentTarget)}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 text-stone-300 hover:text-stone-500 hover:bg-stone-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ transform: 'translateX(-100%) translateY(-50%)' }}
                title="Add block"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {sortedBlocks.map((block, index) => (
              <div key={block._id}>
                <div data-block-id={block._id}>
                  <SortableBlock
                    block={block}
                    figure={
                      block.figureId
                        ? figureMap.get(block.figureId)
                        : undefined
                    }
                    draftId={draftId}
                    onChange={(content) => onBlockChange(block._id, content)}
                    onDelete={() => onDeleteBlock(block._id)}
                    onDuplicate={() => handleDuplicateBlock(block._id)}
                    onFigureCreated={(figureId) => onFigureCreated(block._id, figureId)}
                    onFigureUpdated={onFigureUpdated}
                    onOpenSlashMenu={handleBlockOpenSlashMenu}
                    onInsertParagraphAfter={() => handleInsertParagraphAfter(block._id)}
                    onSplitBlock={(before, after) => handleSplitBlock(block._id, before, after)}
                    onDeleteEmptyBlock={() => handleDeleteEmptyBlock(block._id)}
                    onFocusNext={() => handleFocusNext(block._id)}
                    onFocusPrevious={() => handleFocusPrevious(block._id)}
                    isFirstBlock={index === 0}
                    isLastBlock={index === sortedBlocks.length - 1}
                  />
                </div>
                {/* Gap after each block with plus on left */}
                <div className="group relative h-6 -mx-3 px-3">
                  <div className="absolute inset-x-3 top-1/2 h-px bg-transparent group-hover:bg-stone-200 transition-colors" />
                  <button
                    onClick={(e) => handleGapPlusClick(block._id, e.currentTarget)}
                    className="absolute left-0 top-1/2 p-1.5 text-stone-300 hover:text-stone-500 hover:bg-stone-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ transform: 'translateX(-100%) translateY(-50%)' }}
                    title="Add block"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Slash command menu */}
      <SlashCommandMenu
        isOpen={slashMenuState.isOpen}
        position={slashMenuState.position}
        onSelect={handleSelectBlockType}
        onClose={handleCloseSlashMenu}
      />
    </>
  );
}
