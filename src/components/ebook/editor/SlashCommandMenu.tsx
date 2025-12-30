'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Heading2,
  Heading3,
  Heading4,
  Quote,
  List,
  ListOrdered,
  Table,
  Image as ImageIcon,
  Code,
} from 'lucide-react';
import type { BlockType } from './ChapterEditor';

interface SlashCommandMenuProps {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

interface BlockOption {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
  listType?: 'bullet' | 'numbered';
}

const BLOCK_OPTIONS: BlockOption[] = [
  {
    type: 'paragraph',
    label: 'Paragraph',
    description: 'Plain text paragraph',
    icon: <Type className="w-5 h-5" />,
  },
  {
    type: 'heading2',
    label: 'Heading 2',
    description: 'Large section heading',
    icon: <Heading2 className="w-5 h-5" />,
  },
  {
    type: 'heading3',
    label: 'Heading 3',
    description: 'Medium section heading',
    icon: <Heading3 className="w-5 h-5" />,
  },
  {
    type: 'heading4',
    label: 'Heading 4',
    description: 'Small section heading',
    icon: <Heading4 className="w-5 h-5" />,
  },
  {
    type: 'blockquote',
    label: 'Quote',
    description: 'Callout or quote box',
    icon: <Quote className="w-5 h-5" />,
  },
  {
    type: 'list',
    label: 'Bullet List',
    description: 'Unordered list with bullets',
    icon: <List className="w-5 h-5" />,
    listType: 'bullet',
  },
  {
    type: 'list',
    label: 'Numbered List',
    description: 'Ordered list with numbers',
    icon: <ListOrdered className="w-5 h-5" />,
    listType: 'numbered',
  },
  {
    type: 'table',
    label: 'Table',
    description: 'Markdown table',
    icon: <Table className="w-5 h-5" />,
  },
  {
    type: 'figure',
    label: 'Figure',
    description: 'Image with caption',
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    type: 'code',
    label: 'Code Block',
    description: 'Syntax-highlighted code',
    icon: <Code className="w-5 h-5" />,
  },
];

export function SlashCommandMenu({
  isOpen,
  position,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredOptions = BLOCK_OPTIONS.filter(
    (option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset state when menu opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[selectedIndex]) {
            onSelect(filteredOptions[selectedIndex].type);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredOptions, onSelect, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!position) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 w-72 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden"
          style={{
            left: Math.min(position.x, window.innerWidth - 300),
            top: Math.min(position.y, window.innerHeight - 400),
          }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-stone-100">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blocks..."
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Options list */}
          <div className="max-h-72 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-stone-400">
                No blocks found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={`${option.type}-${option.listType || ''}`}
                  onClick={() => onSelect(option.type)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    index === selectedIndex
                      ? 'bg-amber-50 text-amber-900'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      index === selectedIndex
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-stone-400">
                      {option.description}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-stone-100 bg-stone-50">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>
                <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded ml-1">
                  ↓
                </kbd>
                <span className="ml-1.5">navigate</span>
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded">
                  Enter
                </kbd>
                <span className="ml-1.5">select</span>
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
