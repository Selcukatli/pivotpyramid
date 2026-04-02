'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import type { EditorFigure } from './ChapterEditor';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Sparkles,
  Loader2,
  AlertCircle,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

// Style options matching the generation action
const STYLE_OPTIONS = [
  { value: 'diagram', label: 'Diagram' },
  { value: 'flowchart', label: 'Flowchart' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'canvas', label: 'Canvas' },
  { value: 'conceptual', label: 'Conceptual' },
] as const;

const ASPECT_RATIO_OPTIONS = [
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
  { value: '1:1', label: '1:1' },
  { value: '3:2', label: '3:2' },
  { value: '21:9', label: '21:9' },
] as const;

const RESOLUTION_OPTIONS = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
] as const;

type StyleValue = (typeof STYLE_OPTIONS)[number]['value'];
type AspectRatioValue = (typeof ASPECT_RATIO_OPTIONS)[number]['value'];
type ResolutionValue = (typeof RESOLUTION_OPTIONS)[number]['value'];
type TabValue = 'generate' | 'upload';

interface FigureLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: Id<'ebookBlocks'>;
  draftId: Id<'ebookDrafts'>;
  figure?: EditorFigure;
  onFigureCreated: (figureId: Id<'ebookFigures'>) => void;
  onFigureUpdated: (figure: EditorFigure) => void;
}

export function FigureLightbox({
  isOpen,
  onClose,
  blockId,
  draftId,
  figure,
  onFigureCreated,
  onFigureUpdated,
}: FigureLightboxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabValue>('generate');

  // Local state for form
  const [localAlt, setLocalAlt] = useState(figure?.alt ?? '');
  const [localCaption, setLocalCaption] = useState(figure?.caption ?? '');
  const [localPrompt, setLocalPrompt] = useState(figure?.prompt ?? '');
  const [localStyle, setLocalStyle] = useState<StyleValue>(
    (figure?.style as StyleValue) ?? 'diagram'
  );
  const [localAspectRatio, setLocalAspectRatio] =
    useState<AspectRatioValue>('4:3');
  const [localResolution, setLocalResolution] = useState<ResolutionValue>('2K');

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Mutations
  const generateUploadUrl = useMutation(api.ebook.mutations.generateUploadUrl);
  const createFigureFromUpload = useMutation(
    api.ebook.mutations.createFigureFromUpload
  );
  const updateFigure = useMutation(api.ebook.mutations.updateFigure);
  const replaceFigureImage = useMutation(
    api.ebook.mutations.replaceFigureImage
  );
  const linkFigureToBlock = useMutation(api.ebook.mutations.linkFigureToBlock);
  const createFigure = useMutation(api.ebook.mutations.createFigure);

  // Action for generation
  const generateFigure = useAction(
    api['lib/fal/actions/generateEbookFigure'].generateFigure
  );

  // Update local state when figure changes
  useEffect(() => {
    if (figure) {
      setLocalAlt(figure.alt ?? '');
      setLocalCaption(figure.caption ?? '');
      setLocalPrompt(figure.prompt ?? '');
      setLocalStyle((figure.style as StyleValue) ?? 'diagram');
    }
  }, [figure]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle file upload (shared between button and drag-drop)
  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be smaller than 10MB');
        return;
      }

      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const uploadUrl = await generateUploadUrl();
        setUploadProgress(20);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const { storageId } = await response.json();
        setUploadProgress(70);

        if (figure) {
          await replaceFigureImage({
            figureId: figure._id,
            newStorageId: storageId,
          });
          setUploadProgress(100);

          onFigureUpdated({
            ...figure,
            storageId,
            url: URL.createObjectURL(file),
          });
        } else {
          const alt = localAlt || file.name.replace(/\.[^.]+$/, '');
          const newFigureId = await createFigureFromUpload({
            draftId,
            storageId,
            alt,
            caption: localCaption || undefined,
          });
          setUploadProgress(90);

          await linkFigureToBlock({ blockId, figureId: newFigureId });
          setUploadProgress(100);

          onFigureCreated(newFigureId);
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError(err instanceof Error ? err.message : 'Failed to upload image');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [
      figure,
      draftId,
      blockId,
      localAlt,
      localCaption,
      generateUploadUrl,
      createFigureFromUpload,
      replaceFigureImage,
      linkFigureToBlock,
      onFigureCreated,
      onFigureUpdated,
    ]
  );

  // Handle file input change
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await uploadFile(file);
      }
    },
    [uploadFile]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        await uploadFile(file);
      }
    },
    [uploadFile]
  );

  // Handle AI generation
  const handleGenerate = useCallback(async () => {
    if (!localPrompt.trim()) {
      setError('Please enter a prompt for generation');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateFigure({
        prompt: localPrompt,
        filename: `figure-${Date.now()}.png`,
        style: localStyle,
        aspect_ratio: localAspectRatio,
        resolution: localResolution,
      });

      if (!result.success || !result.storageId) {
        throw new Error(result.error || 'Generation failed');
      }

      const storageId = result.storageId as Id<'_storage'>;

      if (figure) {
        // Replace existing figure image
        await replaceFigureImage({
          figureId: figure._id,
          newStorageId: storageId,
        });

        // Update metadata including generation info
        await updateFigure({
          figureId: figure._id,
          alt: localAlt || result.description || 'Generated figure',
          caption: localCaption || undefined,
          prompt: result.originalPrompt,
          enhancedPrompt: result.enhancedPrompt,
          style: localStyle,
          width: result.width ?? undefined,
          height: result.height ?? undefined,
        });

        onFigureUpdated({
          ...figure,
          storageId,
          url: result.storageUrl!,
          alt: localAlt || result.description || 'Generated figure',
          caption: localCaption || undefined,
          prompt: result.originalPrompt,
          enhancedPrompt: result.enhancedPrompt,
          style: localStyle,
          width: result.width ?? undefined,
          height: result.height ?? undefined,
        });
      } else {
        // Create new figure
        const figureId = `figure-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newFigureId = await createFigure({
          draftId,
          figureId,
          storageId,
          alt: localAlt || result.description || 'Generated figure',
          caption: localCaption || undefined,
          prompt: result.originalPrompt,
          enhancedPrompt: result.enhancedPrompt,
          style: localStyle,
          width: result.width ?? undefined,
          height: result.height ?? undefined,
        });

        await linkFigureToBlock({ blockId, figureId: newFigureId });
        onFigureCreated(newFigureId);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  }, [
    localPrompt,
    localStyle,
    localAspectRatio,
    localResolution,
    localAlt,
    localCaption,
    figure,
    draftId,
    blockId,
    generateFigure,
    createFigure,
    replaceFigureImage,
    updateFigure,
    linkFigureToBlock,
    onFigureCreated,
    onFigureUpdated,
  ]);

  // Save metadata changes
  const handleSaveMetadata = useCallback(async () => {
    if (!figure) return;

    setIsSaving(true);
    setError(null);

    try {
      await updateFigure({
        figureId: figure._id,
        alt: localAlt,
        caption: localCaption || undefined,
      });

      onFigureUpdated({
        ...figure,
        alt: localAlt,
        caption: localCaption || undefined,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save metadata:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [figure, localAlt, localCaption, updateFigure, onFigureUpdated]);

  const hasMetadataChanges =
    figure &&
    (localAlt !== (figure.alt ?? '') ||
      localCaption !== (figure.caption ?? ''));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h2 className="text-lg font-semibold text-stone-900">
                {figure?.url ? 'Edit Figure' : 'Add Figure'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto p-1 hover:bg-red-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Image preview + Metadata */}
                <div className="space-y-4">
                  {/* Image preview */}
                  {figure?.url ? (
                    <div className="relative aspect-video bg-stone-100 rounded-xl overflow-hidden">
                      <Image
                        src={figure.url}
                        alt={figure.alt}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center aspect-video bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
                      <ImageIcon className="w-12 h-12 text-stone-300 mb-3" />
                      <p className="text-sm text-stone-500 font-medium">
                        No image yet
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        Generate or upload on the right
                      </p>
                    </div>
                  )}

                  {/* Metadata fields */}
                  <div className="space-y-3">
                    {/* Alt text */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={localAlt}
                        onChange={(e) => setLocalAlt(e.target.value)}
                        placeholder="Describe the image for accessibility..."
                        className="w-full px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Caption */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">
                        Caption
                      </label>
                      <input
                        type="text"
                        value={localCaption}
                        onChange={(e) => setLocalCaption(e.target.value)}
                        placeholder="Figure caption (optional)..."
                        className="w-full px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 italic"
                      />
                    </div>

                    {/* Save metadata button */}
                    {hasMetadataChanges && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleSaveMetadata}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : saved ? (
                          <>
                            <Check className="w-4 h-4" />
                            Saved!
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Enhanced prompt preview */}
                  {figure?.enhancedPrompt && (
                    <div className="p-3 bg-stone-50 rounded-lg">
                      <p className="text-xs font-medium text-stone-500 mb-1">
                        Enhanced Prompt (used for generation)
                      </p>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {figure.enhancedPrompt}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Tabs (Generate / Upload) */}
                <div className="space-y-4">
                  {/* Tab buttons */}
                  <div className="flex gap-1 p-1 bg-stone-100 rounded-lg">
                    <button
                      onClick={() => setActiveTab('generate')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'generate'
                          ? 'bg-white text-stone-900 shadow-sm'
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </button>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'upload'
                          ? 'bg-white text-stone-900 shadow-sm'
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>

                  {/* Tab content */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'generate' ? (
                      <motion.div
                        key="generate"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        {/* Prompt */}
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1.5">
                            Prompt
                          </label>
                          <textarea
                            value={localPrompt}
                            onChange={(e) => setLocalPrompt(e.target.value)}
                            placeholder="Describe the figure you want to generate..."
                            rows={4}
                            className="w-full px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                          />
                        </div>

                        {/* Generation options */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">
                              Style
                            </label>
                            <select
                              value={localStyle}
                              onChange={(e) =>
                                setLocalStyle(e.target.value as StyleValue)
                              }
                              className="w-full px-2 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                            >
                              {STYLE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">
                              Aspect
                            </label>
                            <select
                              value={localAspectRatio}
                              onChange={(e) =>
                                setLocalAspectRatio(
                                  e.target.value as AspectRatioValue
                                )
                              }
                              className="w-full px-2 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                            >
                              {ASPECT_RATIO_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">
                              Resolution
                            </label>
                            <select
                              value={localResolution}
                              onChange={(e) =>
                                setLocalResolution(
                                  e.target.value as ResolutionValue
                                )
                              }
                              className="w-full px-2 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                            >
                              {RESOLUTION_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Generate button */}
                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating || !localPrompt.trim()}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Image
                            </>
                          )}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* Drop zone */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                            isDragging
                              ? 'border-amber-500 bg-amber-50'
                              : isUploading
                                ? 'border-amber-400 bg-amber-50'
                                : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50/50'
                          }`}
                        >
                          {isUploading ? (
                            <div className="text-center">
                              <Loader2 className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-spin" />
                              <p className="text-sm text-amber-600 font-medium">
                                Uploading... {uploadProgress}%
                              </p>
                              <div className="mt-3 w-40 h-2 bg-amber-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload
                                className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-amber-500' : 'text-stone-300'}`}
                              />
                              <p className="text-base text-stone-600 font-medium">
                                {isDragging
                                  ? 'Drop image here'
                                  : 'Click to upload or drag and drop'}
                              </p>
                              <p className="text-sm text-stone-400 mt-2">
                                PNG, JPG, WebP up to 10MB
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
