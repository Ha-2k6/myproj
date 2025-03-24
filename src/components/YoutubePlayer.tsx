import React, { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  onStateChange: (state: number) => void;
  onProgress: (time: number, duration: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer({ 
  videoId, 
  isPlaying,
  onStateChange, 
  onProgress 
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<number>();
  const isInitialized = useRef(false);

  const startProgressTracker = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    progressInterval.current = window.setInterval(() => {
      if (playerRef.current) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          onProgress(currentTime, duration);
        } catch (error) {
          console.error('Error getting player time:', error);
        }
      }
    }, 1000);
  };

  const stopProgressTracker = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      if (!isInitialized.current && containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '0',
          width: '0',
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0
          },
          events: {
            onReady: (event: any) => {
              if (isPlaying) {
                event.target.playVideo();
              }
            },
           onStateChange: (event: any) => {
  onStateChange(event.data);

  if (event.data === window.YT.PlayerState.PLAYING) {
    startProgressTracker();
  } else {
    stopProgressTracker();
  }

  // Properly restart video on END
  if (event.data === window.YT.PlayerState.ENDED) {
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.seekTo(0, true); // Seek to start
        playerRef.current.playVideo(); // Play again
      }
    }, 500); // Small delay to ensure smooth restart
  }
}



          }
        });
        isInitialized.current = true;
      }
    };

    if (window.YT && window.YT.Player && !isInitialized.current && containerRef.current) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      stopProgressTracker();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      isInitialized.current = false;
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && videoId) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  useEffect(() => {
    if (playerRef.current) {
      try {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (error) {
        console.error('Error controlling playback:', error);
      }
    }
  }, [isPlaying]);

  return <div ref={containerRef} style={{ display: 'none' }} />;
}
