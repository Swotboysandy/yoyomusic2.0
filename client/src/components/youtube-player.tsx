import { useEffect, useRef, useState } from "react";

interface YouTubePlayerProps {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YouTubePlayer({
  videoId,
  isPlaying,
  currentTime,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);

  // Load YouTube API
  useEffect(() => {
    if (window.YT) {
      setApiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      setApiLoaded(true);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize player
  useEffect(() => {
    if (!apiLoaded || !videoId) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: () => {
          setIsReady(true);
          playerRef.current.seekTo(currentTime);
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            onPlay();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            onPause();
          } else if (event.data === window.YT.PlayerState.ENDED) {
            onEnded();
          }
        }
      }
    });
  }, [apiLoaded, videoId]);

  // Handle play/pause
  useEffect(() => {
    if (!isReady || !playerRef.current) return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, isReady]);

  // Handle seeking
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    
    const currentPlayerTime = playerRef.current.getCurrentTime();
    if (Math.abs(currentPlayerTime - currentTime) > 2) {
      playerRef.current.seekTo(currentTime);
    }
  }, [currentTime, isReady]);

  // Time update interval
  useEffect(() => {
    if (!isReady || !isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        onTimeUpdate(time);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady, isPlaying, onTimeUpdate]);

  return <div id="youtube-player" style={{ display: 'none' }} />;
}