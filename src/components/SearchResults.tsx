import React from 'react';
import { Play } from 'lucide-react';
import type { Video } from '../types';

interface SearchResultsProps {
  results: Video[];
  onSelect: (video: Video) => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  return (
    <div className="w-full max-w-xl mt-4 bg-white rounded-lg shadow-lg overflow-hidden">
      {results.map((video) => (
        <div
          key={video.id}
          className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
          onClick={() => onSelect(video)}
        >
          <div className="relative group">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-16 h-16 rounded object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
              <Play size={24} className="text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{video.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
