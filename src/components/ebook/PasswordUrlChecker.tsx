'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEbookAccessStore } from '@/stores/ebookAccessStore';
import { UnlockSuccessModal } from './UnlockSuccessModal';

/**
 * Component that checks for ?pwd query parameter in the URL
 * and automatically grants access if the password is correct.
 * Shows the unlock success modal when access is granted via URL.
 *
 * Usage: Add to ebook layout to support links like:
 * pivotpyramid.com/ebook/?pwd=letspivot26
 */
export function PasswordUrlChecker() {
  const searchParams = useSearchParams();
  const hasAccess = useEbookAccessStore((state) => state.hasAccess);
  const grantAccess = useEbookAccessStore((state) => state.grantAccess);
  const redeemCode = useMutation(api.ebookAccess.redeemCode);
  const [hasChecked, setHasChecked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Only check once and if user doesn't already have access
    if (hasAccess || hasChecked) return;

    const pwd = searchParams.get('pwd');
    if (!pwd) {
      setHasChecked(true);
      return;
    }

    // Validate the code via Convex
    const validateCode = async () => {
      try {
        const result = await redeemCode({
          code: pwd,
          metadata: {
            referrer: typeof window !== 'undefined' ? document.referrer : undefined,
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
          },
        });

        if (result.valid) {
          grantAccess();
          setShowSuccessModal(true);
        }
      } catch (error) {
        console.error('Error validating access code:', error);
      } finally {
        setHasChecked(true);
      }
    };

    validateCode();
  }, [searchParams, hasAccess, hasChecked, redeemCode, grantAccess]);

  return (
    <UnlockSuccessModal
      isOpen={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
    />
  );
}
