'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Twitter } from 'lucide-react';
import { useEbookAccessStore } from '@/stores/ebookAccessStore';

interface UnlockSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnlockSuccessModal({ isOpen, onClose }: UnlockSuccessModalProps) {
  const clearJustUnlocked = useEbookAccessStore((state) => state.clearJustUnlocked);

  const tweetText = `Just unlocked early access to "The Pivot Pyramid" - an ebook on when and how to pivot your startup by @selcukatli`;
  const tweetUrl = 'https://pivotpyramid.com/ebook';
  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(tweetUrl)}`;

  const handleShareOnTwitter = () => {
    window.open(twitterIntentUrl, '_blank', 'width=550,height=420');
  };

  const handleClose = () => {
    clearJustUnlocked();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 transition-colors rounded-full hover:bg-stone-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              {/* Success Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  Access Unlocked!
                </h2>
                <p className="text-stone-600">
                  You now have full access to The Pivot Pyramid ebook. Enjoy reading!
                </p>
              </div>

              {/* Share prompt */}
              <div className="bg-stone-50 rounded-xl p-6 text-center">
                <p className="text-sm text-stone-600 mb-4">
                  Enjoying the book? Help spread the word!
                </p>
                <button
                  onClick={handleShareOnTwitter}
                  className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Twitter className="w-5 h-5" />
                  Share on X
                </button>
              </div>

              {/* Continue button */}
              <button
                onClick={handleClose}
                className="w-full mt-4 py-3 text-stone-600 font-medium hover:text-stone-800 transition-colors"
              >
                Continue Reading
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
