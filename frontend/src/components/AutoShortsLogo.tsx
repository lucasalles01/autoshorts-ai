import React from 'react';

export const AutoShortsLogo: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <div 
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="32" cy="32" r="30" fill="url(#gradient)" />
        
        {/* AS text */}
        <text
          x="32"
          y="38"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="white"
          fontFamily="Arial, sans-serif"
        >
          AS
        </text>
        
        {/* Play triangle */}
        <path
          d="M28 26 L40 32 L28 38 Z"
          fill="#C084FC"
          opacity="0.8"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};