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

    video.addEventListener('canplaythrough', handleCanPlay);
    initVideo();

    const handleScroll = () => {
      // Scrub video based on scroll position
      // Video plays from 0% to 100% over 200px of scrolling (immediate response)
      if (video.duration && video.readyState >= 2) {
        const scrollProgress = Math.min(window.scrollY / 200, 1);
        video.currentTime = scrollProgress * video.duration;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Set initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      video.removeEventListener('canplaythrough', handleCanPlay);
    };
  }, []);

  return (
    <div className="relative" style={{ width, height }}>
      {/* Fallback image for iOS Safari where video scrubbing doesn't work */}
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
        style={{ width, height, objectFit: 'fill' }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}
