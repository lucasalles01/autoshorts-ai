import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

interface CaptionPreviewProps {
  videoUrl?: string;
  captionText: string;
  captionStyle: 'VIRAL' | 'MODERN' | 'MINIMAL' | 'PROFESSIONAL';
  primaryColor: string;
  highlightColor: string;
  fontSize?: number;
  position?: 'CENTER_BOTTOM' | 'CENTER' | 'TOP';
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const CaptionPreview: React.FC<CaptionPreviewProps> = ({
  videoUrl,
  captionText,
  captionStyle,
  primaryColor,
  highlightColor,
  fontSize = 24,
  position = 'CENTER_BOTTOM',
  onPlayStateChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      onPlayStateChange?.(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const getCaptionStyle = () => {
    const baseStyle = {
      fontSize: `${fontSize}px`,
      color: primaryColor,
      transition: 'all 0.3s ease'
    };

    switch (captionStyle) {
      case 'VIRAL':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          border: `2px solid ${highlightColor}40`,
          textShadow: `0 0 20px ${highlightColor}`,
          boxShadow: `0 0 30px ${highlightColor}40`
        };
      case 'MODERN':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(6, 182, 212, 0.8)',
          padding: '10px 18px',
          borderRadius: '8px',
          fontWeight: '700',
          border: `2px solid ${highlightColor}40`,
          backdropFilter: 'blur(10px)'
        };
      case 'MINIMAL':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '8px 16px',
          borderRadius: '6px',
          fontWeight: '500',
          border: 'none'
        };
      case 'PROFESSIONAL':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(88, 28, 135, 0.8)',
          padding: '12px 24px',
          borderRadius: '10px',
          fontWeight: '600',
          border: `2px solid ${highlightColor}40`,
          fontFamily: 'Georgia, serif'
        };
      default:
        return baseStyle;
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'CENTER':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'TOP':
        return { top: '10%', left: '50%', transform: 'translateX(-50%)' };
      case 'CENTER_BOTTOM':
      default:
        return { bottom: '15%', left: '50%', transform: 'translateX(-50%)' };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-3xl border-4 border-cyber-border shadow-2xl overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Caption Overlay */}
      {showOverlay && (
        <div 
          className="absolute z-10 text-center max-w-[90%]"
          style={getPositionStyle()}
        >
          <div style={getCaptionStyle()}>
            {captionText || 'Sua legenda aparecerá aqui'}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 hover:opacity-100 transition-opacity">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="p-2 rounded-lg bg-black/50 backdrop-blur-md text-white hover:bg-black/70"
            title="Toggle Captions"
          >
            {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-lg bg-black/50 backdrop-blur-md text-white hover:bg-black/70"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-white text-xs font-mono">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <span className="text-white text-xs font-mono">{formatTime(duration)}</span>
          </div>

          {/* Style Info */}
          <div className="flex items-center justify-between">
            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
              {captionStyle} • {fontSize}px
            </div>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              className="p-2 rounded-lg bg-black/50 backdrop-blur-md text-white hover:bg-black/70"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 9:16 Safe Area Indicator */}
      <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-gray-300 border border-white/10 pointer-events-none">
        9:16 (1080x1920) Preview
      </div>
    </div>
  );
};