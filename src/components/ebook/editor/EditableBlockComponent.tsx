'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { GripVertical, Trash2, Copy, Plus } from 'lucide-react';
import type { EditableBlock, EditorFigure, BlockType } from './ChapterEditor';
import type { Id } from '../../../../convex/_generated/dataModel';
import { FigureBlockEditor } from './FigureBlockEditor';

interface EditableBlockComponentProps {
  block: EditableBlock;
  figure?: EditorFigure;
  draftId: Id<'ebookDrafts'>;
  onChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFigureCreated: (figureId: Id<'ebookFigures'>) => void;
  onFigureUpdated: (figure: EditorFigure) => void;
  onOpenSlashMenu: (element: HTMLElement) => void;
  onInsertParagraphAfter: () => void;
  onSplitBlock: (beforeContent: string, afterContent: string) => void;
  onDeleteEmptyBlock: () => void;
  onFocusNext: () => void;
  onFocusPrevious: () => void;
  isFirstBlock?: boolean;
  isLastBlock?: boolean;
  dragHandleProps: React.HTMLAttributes<HTMLButtonElement>;
}

const BLOCK_TYPE_STYLES: Record<BlockType, string> = {
  paragraph: 'font-serif text-[17px] leading-[1.8] text-stone-700',
  heading2:
    'font-sans font-bold text-[28px] leading-tight text-stone-900 mt-6 mb-1',
  heading3:
    'font-sans font-semibold text-[22px] leading-tight text-stone-800 mt-5 mb-1',
  heading4:
    'font-sans font-semibold text-[18px] leading-tight text-stone-800 mt-4 mb-1',
  blockquote:
    'font-serif italic text-[17px] leading-[1.8] text-stone-600 border-l-4 border-amber-400 pl-5 py-1 bg-amber-50/50',
  list: 'font-serif text-[17px] leading-[1.8] text-stone-700',
  table: 'font-mono text-sm text-stone-700',
  figure: '',
  code: 'font-mono text-sm bg-stone-900 text-stone-100 p-4 rounded-lg overflow-x-auto',
};

const BLOCK_PLACEHOLDERS: Record<BlockType, string> = {
  paragraph: "Type '/' for commands, or start writing...",
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  heading4: 'Heading 4',
  blockquote: 'Quote or callout...',
  list: '- List item (use markdown syntax)',
  table: '| Column 1 | Column 2 |',
  figure: '',
  code: '// Code block',
};

// Handle top offset to align with content (accounts for margin-top on headings)
const HANDLE_TOP_OFFSET: Record<BlockType, string> = {
  paragraph: 'top-0.5',
  heading2: 'top-[26px]', // mt-6 (24px) + 2px
  heading3: 'top-[22px]', // mt-5 (20px) + 2px
  heading4: 'top-[18px]', // mt-4 (16px) + 2px
  blockquote: 'top-1.5',
  list: 'top-0.5',
  table: 'top-0.5',
  figure: 'top-3',
  code: 'top-4',
};

export function EditableBlockComponent({
  block,
  figure,
  draftId,
  onChange,
  onDelete,
  onDuplicate,
  onFigureCreated,
  onFigureUpdated,
  onOpenSlashMenu,
  onInsertParagraphAfter,
  onSplitBlock,
  onDeleteEmptyBlock,
  onFocusNext,
  onFocusPrevious,
  isFirstBlock,
  isLastBlock,
  dragHandleProps,
}: EditableBlockComponentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setIsSelected(false);
      }
    };
    if (showMenu || isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, isSelected]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [block.content]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Slash command in empty block
      if (e.key === '/' && block.content === '' && containerRef.current) {
        e.preventDefault();
        onOpenSlashMenu(containerRef.current);
        return;
      }

      // Backspace/Delete on empty block deletes the block (unless it's the first/only block)
      if ((e.key === 'Backspace' || e.key === 'Delete') && block.content === '' && !isFirstBlock) {
        e.preventDefault();
        onDeleteEmptyBlock();
        return;
      }

      // Arrow down at end of content or on single-line block → focus next block
      if (e.key === 'ArrowDown' && !isLastBlock) {
        const textarea = e.currentTarget;
        const cursorPos = textarea.selectionStart;
        // Check if cursor is at end or if content is single line
        const isAtEnd = cursorPos === block.content.length;
        const isSingleLine = !block.content.includes('\n');
        if (isAtEnd || isSingleLine) {
          e.preventDefault();
          onFocusNext();
          return;
        }
      }

      // Arrow up at start of content or on single-line block → focus previous block
      if (e.key === 'ArrowUp' && !isFirstBlock) {
        const textarea = e.currentTarget;
        const cursorPos = textarea.selectionStart;
        // Check if cursor is at start or if content is single line
        const isAtStart = cursorPos === 0;
        const isSingleLine = !block.content.includes('\n');
        if (isAtStart || isSingleLine) {
          e.preventDefault();
          onFocusPrevious();
          return;
        }
      }

      // Enter key creates new paragraph (Shift+Enter for line break within block)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const textarea = e.currentTarget;
        const cursorPos = textarea.selectionStart;
        const content = block.content;

        // If cursor is at end of block, create new empty paragraph after
        if (cursorPos === content.length) {
          onInsertParagraphAfter();
          return;
        }

        // If cursor is in middle, split block at cursor position
        const beforeCursor = content.slice(0, cursorPos);
        const afterCursor = content.slice(cursorPos);
        onSplitBlock(beforeCursor, afterCursor);
      }
    },
    [block.content, onOpenSlashMenu, onInsertParagraphAfter, onSplitBlock, onDeleteEmptyBlock, isFirstBlock, isLastBlock, onFocusNext, onFocusPrevious]
  );

  // Handle input change with slash detection
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;

      // If user types "/" at the start of an empty block, open slash menu
      if (value === '/' && containerRef.current) {
        onOpenSlashMenu(containerRef.current);
        return;
      }

      onChange(value);
    },
    [onChange, onOpenSlashMenu]
  );

  // Handle grip click - show menu and select block
  const handleGripClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(true);
    setShowMenu(true);
  };

  const showControls = isHovered || isFocused || isSelected;

  // Render figure block
  if (block.type === 'figure') {
    return (
      <div
        ref={containerRef}
        className={`relative group py-3 -mx-3 px-3 rounded-lg transition-colors ${
          isSelected ? 'bg-amber-50 ring-2 ring-amber-200' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Handle + Menu trigger */}
        <div
          ref={menuRef}
          className={`absolute left-0 top-3 flex items-center transition-opacity duration-100 ${
            showControls ? 'opacity-100' : 'opacity-0'
          } ${showMenu ? 'z-50' : ''}`}
          style={{ transform: 'translateX(-100%)' }}
        >
          <button
            onClick={handleGripClick}
            className={`p-1.5 rounded transition-colors ${
              isSelected
                ? 'text-stone-600 bg-stone-200'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            } cursor-grab active:cursor-grabbing`}
            title="Click to select, drag to move"
            {...dragHandleProps}
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-stone-200 py-1.5">
              <button
                onClick={() => {
                  onDuplicate();
                  setShowMenu(false);
                  setIsSelected(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-stone-400" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                  setIsSelected(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Figure content */}
        <div className="max-w-2xl mx-auto">
          <FigureBlockEditor
            blockId={block._id}
            draftId={draftId}
            figure={figure}
            onFigureCreated={onFigureCreated}
            onFigureUpdated={onFigureUpdated}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }

  // Regular text blocks - Notion-like inline editing
  return (
    <div
      ref={containerRef}
      className={`relative group -mx-3 px-3 rounded-lg transition-colors ${
        isSelected ? 'bg-amber-50 ring-2 ring-amber-200' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Handle + Menu trigger */}
      <div
        ref={menuRef}
        className={`absolute left-0 ${HANDLE_TOP_OFFSET[block.type]} flex items-center transition-opacity duration-100 ${
          showControls ? 'opacity-100' : 'opacity-0'
        } ${showMenu ? 'z-50' : ''}`}
        style={{ transform: 'translateX(-100%)' }}
      >
        <button
          onClick={handleGripClick}
          className={`p-1.5 rounded transition-colors ${
            isSelected
              ? 'text-stone-600 bg-stone-200'
              : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
          } cursor-grab active:cursor-grabbing`}
          title="Click to select, drag to move"
          {...dragHandleProps}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-stone-200 py-1.5 z-50">
            <button
              onClick={() => {
                onDuplicate();
                setShowMenu(false);
                setIsSelected(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <Copy className="w-4 h-4 text-stone-400" />
              Duplicate
            </button>
            <button
              onClick={() => {
                onDelete();
                setShowMenu(false);
                setIsSelected(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Unsaved indicator - aligned with handle */}
      {block.isDirty && (
        <div className={`absolute -left-1.5 ${HANDLE_TOP_OFFSET[block.type]} mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full`} />
      )}

      {/* Content textarea - clean, no borders */}
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={BLOCK_PLACEHOLDERS[block.type]}
        className={`w-full resize-none bg-transparent outline-none placeholder:text-stone-400 ${BLOCK_TYPE_STYLES[block.type]}`}
        rows={1}
      />
    </div>
  );
}
