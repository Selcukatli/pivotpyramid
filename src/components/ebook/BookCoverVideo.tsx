'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface BookCoverVideoProps {
  videoSrc: string;
  posterSrc: string;
  alt: string;
  width: number;
  height: number;
}

export function BookCoverVideo({
  videoSrc,
  posterSrc,
  alt,
  width,
  height,
}: BookCoverVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // iOS Safari requires special handling to load video frames for scrubbing
    const initVideo = async () => {
      try {
        // Load metadata first
        video.load();

        // On iOS Safari, we need to briefly play then pause to prime the video frames
        // This works around the restriction that prevents seeking without user interaction
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          video.pause();
          video.currentTime = 0;
          setVideoReady(true);
        }
      } catch {
        // If autoplay fails (expected on iOS), keep showing the fallback image
      }
    };

    // Mark video ready when it has enough data to scrub
    const handleCanPlay = () => {
      setVideoReady(true);
    };

    const handleScroll = () => {
      // Scrub video based on scroll position
      if (video.duration && video.readyState >= 2) {
        // Calculate scroll progress: 0 to 1 based on viewport height
        // Video plays fully over 80% of viewport height for a nice pace
        const scrollProgress = Math.min(
          window.scrollY / (window.innerHeight * 0.8),
          1
        );

        // Map scroll progress to video time
        video.currentTime = scrollProgress * video.duration;
      }
    };

    video.addEventListener('canplaythrough', handleCanPlay);
    window.addEventListener('scroll', handleScroll, { passive: true });

    initVideo();
    handleScroll(); // Set initial position

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative" style={{ width, height }}>
      {/* Fallback image - shown until video is ready */}
      <Image
        src={posterSrc}
        alt={alt}
        width={width}
        height={height}
        className={`rounded-lg shadow-xl transition-opacity duration-300 ${
          videoReady ? 'opacity-0 absolute inset-0' : 'opacity-100'
        }`}
        priority
      />

      {/* Scroll-controlled video */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster={posterSrc}
        className={`rounded-lg shadow-xl transition-opacity duration-300 ${
          videoReady ? 'opacity-100' : 'opacity-0 absolute inset-0'
        }`}
        style={{ width, height, objectFit: 'cover' }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}
