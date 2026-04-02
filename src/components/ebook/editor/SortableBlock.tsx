'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Id } from '../../../../convex/_generated/dataModel';
import { EditableBlock, type EditorFigure } from './ChapterEditor';
import { EditableBlockComponent } from './EditableBlockComponent';

interface SortableBlockProps {
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
}

export function SortableBlock({
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
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EditableBlockComponent
        block={block}
        figure={figure}
        draftId={draftId}
        onChange={onChange}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onFigureCreated={onFigureCreated}
        onFigureUpdated={onFigureUpdated}
        onOpenSlashMenu={onOpenSlashMenu}
        onInsertParagraphAfter={onInsertParagraphAfter}
        onSplitBlock={onSplitBlock}
        onDeleteEmptyBlock={onDeleteEmptyBlock}
        onFocusNext={onFocusNext}
        onFocusPrevious={onFocusPrevious}
        isFirstBlock={isFirstBlock}
        isLastBlock={isLastBlock}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
