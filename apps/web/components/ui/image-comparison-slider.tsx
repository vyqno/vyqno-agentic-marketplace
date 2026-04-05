"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  altBefore?: string;
  altAfter?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const ImageComparison = ({
  beforeImage,
  afterImage,
  altBefore = "Before",
  altAfter = "After",
  beforeLabel = "Before",
  afterLabel = "After",
  className = "",
}: ImageComparisonProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newPosition = ((clientX - rect.left) / rect.width) * 100;
      newPosition = Math.max(0, Math.min(100, newPosition));
      setSliderPosition(newPosition);
    },
    [isDragging]
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);

  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => setIsDragging(false);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* After Image — revealed on the left */}
      <div
        className="absolute top-0 left-0 h-full w-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={afterImage}
          alt={altAfter}
          className="h-full w-full object-cover object-center"
          draggable={false}
        />
        {/* After label */}
        <div className="absolute top-4 left-4 font-mono text-[10px] text-white uppercase tracking-widest bg-black/60 px-2 py-1">
          {afterLabel}
        </div>
      </div>

      {/* Before Image — always visible underneath */}
      <img
        src={beforeImage}
        alt={altBefore}
        className="block h-full w-full object-cover object-center"
        draggable={false}
      />

      {/* Before label */}
      <div className="absolute top-4 right-4 font-mono text-[10px] text-white uppercase tracking-widest bg-black/60 px-2 py-1">
        {beforeLabel}
      </div>

      {/* Slider track */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white cursor-ew-resize flex items-center justify-center"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Handle */}
        <div
          className={`bg-white rounded-full h-10 w-10 flex items-center justify-center shadow-lg transition-transform duration-150 ${
            isDragging ? "scale-125" : "scale-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black"
          >
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 3 12 9 6" transform="translate(6,0)" />
          </svg>
        </div>
      </div>
    </div>
  );
};
