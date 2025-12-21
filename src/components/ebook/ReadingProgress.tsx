'use client';

import { useReadingProgress } from '@/hooks/useReadingProgress';

interface ReadingProgressProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function ReadingProgress({ size = 'md', className = '' }: ReadingProgressProps) {
  const { progress, isVisible } = useReadingProgress();

  // Circular progress indicator
  const radius = size === 'sm' ? 12 : 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const sizeClasses = size === 'sm'
    ? 'w-9 h-9'
    : 'w-12 h-12';

  const svgSize = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  const viewBox = size === 'sm' ? '0 0 30 30' : '0 0 40 40';
  const center = size === 'sm' ? 15 : 20;
  const strokeWidth = size === 'sm' ? 2.5 : 3;
  const textSize = size === 'sm' ? 'text-[8px]' : 'text-[10px]';

  if (!isVisible) return null;

  return (
    <div className={className}>
      <div className={`relative flex items-center justify-center ${sizeClasses} bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-stone-200`}>
        <svg className={`${svgSize} -rotate-90`} viewBox={viewBox}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-150"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
        <span className={`absolute ${textSize} font-medium text-stone-600`}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
