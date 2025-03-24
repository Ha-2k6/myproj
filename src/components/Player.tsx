import React from 'react';
import { Play, Pause, Volume2, Repeat } from 'lucide-react';

interface PlayerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  currentSong?: { title: string; thumbnail: string } | null;
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isRepeatEnabled: boolean;
  onRepeatToggle: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function Player({ 
  isPlaying, 
  onPlayPause,
  currentSong,
  progress,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isRepeatEnabled,
  onRepeatToggle,
  onPrevious,
  onNext
}: PlayerProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-4">
      {currentSong ? (
        <>
          <div className="flex items-center gap-4 mb-4">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{currentSong.title}</h3>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative h-1 bg-gray-200 rounded-full">
              <input
                type="range"
                min="0"
                max={duration}
                value={progress}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="absolute w-full h-1 opacity-0 cursor-pointer"
              />
              <div 
                className="absolute h-full bg-purple-500 rounded-full"
                style={{ width: `${(progress / duration) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onPlayPause}
                className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={onRepeatToggle}
                className={`p-2 rounded-full transition-colors ${
                  isRepeatEnabled 
                    ? 'text-purple-500 bg-purple-100' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Repeat size={24} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 size={20} className="text-gray-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-24 accent-purple-500"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-4 text-gray-500">
          Search and select a song to play
        </div>
      )}
    </div>
  );
}
