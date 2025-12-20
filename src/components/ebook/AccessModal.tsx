'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, BookOpen, CheckCircle, AlertCircle, Twitter } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEbookAccessStore } from '@/stores/ebookAccessStore';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EARLY_ACCESS_PASSWORD = 'letspivot26';

export function AccessModal({ isOpen, onClose }: AccessModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const subscribe = useMutation(api.ebookSubscribers.subscribe);
  const grantAccess = useEbookAccessStore((state) => state.grantAccess);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setIsSubmittingEmail(true);

    try {
      console.log('Calling subscribe mutation with email:', email.trim());
      console.log('Subscribe function:', subscribe);

      if (!subscribe) {
        console.error('Subscribe mutation is not available');
        setEmailError('Connection error. Please refresh and try again.');
        setIsSubmittingEmail(false);
        return;
      }

      // Add timeout to prevent infinite hang
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Mutation timeout after 10s')), 10000)
      );

      const result = await Promise.race([
        subscribe({ email: email.trim() }),
        timeoutPromise
      ]);
      console.log('Subscribe result:', result);
      setEmailSuccess(true);
      setEmail(''); // Clear email to show success message in input
    } catch (error) {
      console.error('Subscribe error:', error);
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!password.trim()) {
      setPasswordError('Please enter the password');
      return;
    }

    if (password.trim() !== EARLY_ACCESS_PASSWORD) {
      setPasswordError('Incorrect password');
      return;
    }

    grantAccess();
    onClose();
  };

  const handleClose = () => {
    // Reset state on close
    setEmail('');
    setPassword('');
    setEmailError('');
    setPasswordError('');
    setEmailSuccess(false);
    onClose();
  };

  const tweetText = `Just signed up for "The Pivot Pyramid" - an ebook on when and how to pivot your startup by @selcukatli`;
  const tweetUrl = 'https://pivotpyramid.com/ebook';
  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(tweetUrl)}`;

  const handleShareOnTwitter = () => {
    window.open(twitterIntentUrl, '_blank', 'width=550,height=420');
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
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                  <BookOpen className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  Early Access
                </h2>
                <p className="text-stone-600">
                  Get notified when the full book is available.
                </p>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="mb-6">
                <div className="relative">
                  {emailSuccess ? (
                    // Success state with share prompt
                    <div className="text-center">
                      <div className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-xl flex items-center mb-4">
                        <CheckCircle className="absolute left-4 top-4 w-5 h-5 text-green-600" />
                        <span className="text-green-700 text-sm">You&apos;re on the list! We&apos;ll notify you.</span>
                      </div>
                      {/* Share prompt after successful signup */}
                      <p className="text-sm text-stone-600 mb-3">
                        Share to get access earlier
                      </p>
                      <button
                        type="button"
                        onClick={handleShareOnTwitter}
                        className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Twitter className="w-5 h-5" />
                        Share on X
                      </button>
                    </div>
                  ) : (
                    <>
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError('');
                        }}
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        disabled={isSubmittingEmail}
                      />
                    </>
                  )}
                </div>
                {emailError && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {emailError}
                  </div>
                )}
                {!emailSuccess && (
                  <button
                    type="submit"
                    disabled={isSubmittingEmail}
                    className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingEmail ? 'Joining...' : 'Join Waitlist'}
                  </button>
                )}
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm text-stone-500">have a password?</span>
                </div>
              </div>

              {/* Password Form */}

              <form onSubmit={handlePasswordSubmit}>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Enter password"
                    className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
                {passwordError && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {passwordError}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full mt-3 py-3 border border-stone-300 text-stone-700 rounded-xl font-semibold hover:bg-stone-50 hover:border-stone-400 transition-colors"
                >
                  Unlock Access
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
