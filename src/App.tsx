import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import { usePlaylist } from './contexts/PlaylistContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import HomePage from './pages/HomePage';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { Player } from './components/Player';
import { YouTubePlayer } from './components/YouTubePlayer';
import type { Video, SearchResponse } from './types';
import { Music } from 'lucide-react';

const YOUTUBE_API_KEY = 'AIzaSyCDCpxoqh_r-tNjIfWEqH7n8sSp2dazGwo'; // Replace with your API key

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { currentUser } = useUser();
  const { playlists } = usePlaylist();
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [searchResults, setSearchResults] = useState<Video[]>([]);

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&type=video&key=${YOUTUBE_API_KEY}`
      );
      const data: SearchResponse = await response.json();
      
      const videos: Video[] = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url
      }));
      
      setSearchResults(videos);
    } catch (error) {
      console.error('Error searching videos:', error);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setCurrentVideoId(video.id);
    setIsPlaying(true);
    setProgress(0);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlayerStateChange = (state: number) => {
    if (state === window.YT?.PlayerState?.ENDED) {
      if (isRepeatEnabled && currentVideoId) {
        // Restart the same video
        const player = document.querySelector('iframe')?.contentWindow;
        player?.postMessage({ event: 'command', func: 'seekTo', args: [0, true] }, '*');
        setIsPlaying(true);
      }
    }
  };

  const handleProgress = (currentTime: number, videoDuration: number) => {
    setProgress(currentTime);
    setDuration(videoDuration);
  };

  const handleSeek = (time: number) => {
    const player = document.querySelector('iframe')?.contentWindow;
    player?.postMessage({ event: 'command', func: 'seekTo', args: [time, true] }, '*');
    setProgress(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    const player = document.querySelector('iframe')?.contentWindow;
    player?.postMessage({ event: 'command', func: 'setVolume', args: [newVolume] }, '*');
  };

  const handleRepeatToggle = () => {
    setIsRepeatEnabled(!isRepeatEnabled);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200 flex flex-col items-center p-8 gap-8">
        {currentUser && <Navbar />}
        
        {/* Conditional Rendering for the Search Bar */}
        {currentUser && (
            <>
              <div className="flex items-center gap-3 text-purple-600">
                <Music size={32} />
                <h1 className="text-2xl font-bold">Tad Ow Player</h1>
              </div>
              <SearchBar onSearch={handleSearch} />
            </>
        )}

        {/* Player and Search Results - Visible only if logged in */}
        {currentUser && (
          <>
            {currentVideoId && (
              <YouTubePlayer
                videoId={currentVideoId}
                isPlaying={isPlaying}
                onStateChange={handlePlayerStateChange}
                onProgress={handleProgress}
              />
            )}
            
            <Player
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              currentSong={currentVideoId ? { title: "Playing", thumbnail: `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`} : null}
              progress={progress}
              duration={duration}
              onSeek={handleSeek}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              isRepeatEnabled={isRepeatEnabled}
              onRepeatToggle={handleRepeatToggle}
            />
            
            {searchResults.length > 0 && (
              <SearchResults
                results={searchResults}
                onSelect={handleVideoSelect}
              />
            )}
          </>
        )}
        

        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/" />} />
            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/playlists" element={<PrivateRoute><PlaylistsPage /></PrivateRoute>} />
            <Route path="/playlist/:id" element={<PrivateRoute><PlaylistDetailPage /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
