import { Button } from "@/components/ui/button";
import YouTubePlayer from "@/components/youtube-player";

interface CurrentSong {
  id: string;
  videoId: string;
  title: string;
  duration: number;
  thumbnail?: string;
  channel?: string;
  addedBy: string;
}

interface RoomUser {
  userId: string;
  user: {
    id: string;
    username: string;
  };
}

interface SkipVotes {
  votes: number;
  required: number;
}

interface AudioPlayerProps {
  currentSong: CurrentSong | null;
  isPlaying: boolean;
  currentTime: number;
  skipVotes: SkipVotes;
  roomUsers: RoomUser[];
  onPlayPause: () => void;
  onVoteSkip: () => void;
  onSeek: (time: number) => void;
  onTimeUpdate: (time: number) => void;
  onSongEnded: () => void;
}

export default function AudioPlayer({
  currentSong,
  isPlaying,
  currentTime,
  skipVotes,
  roomUsers,
  onPlayPause,
  onVoteSkip,
  onSeek,
  onTimeUpdate,
  onSongEnded
}: AudioPlayerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-4 p-2">
      {currentSong ? (
        <>
          {/* Current Song Display */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
              {currentSong.thumbnail ? (
                <img 
                  src={currentSong.thumbnail} 
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-music text-sm text-white"></i>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-white line-clamp-1">{currentSong.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-1">{currentSong.channel || 'Unknown Artist'}</p>
            </div>
          </div>
          
          {/* YouTube Player (hidden) */}
          <YouTubePlayer
            videoId={currentSong.videoId}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTimeUpdate={onTimeUpdate}
            onPlay={() => {}}
            onPause={() => {}}
            onEnded={onSongEnded}
          />

          {/* Progress Bar */}
          <div className="flex-1 mx-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentSong.duration)}</span>
            </div>
            <div 
              className="w-full bg-slate-700/50 rounded-full h-1 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                const newTime = percentage * currentSong.duration;
                onSeek(newTime);
              }}
            >
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / currentSong.duration) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={onPlayPause}
              variant="ghost"
              size="icon"
              className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full text-white"
            >
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs`}></i>
            </Button>
            
            <Button
              onClick={onVoteSkip}
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-white hover:text-orange-400 hover:bg-orange-500/20 rounded-full flex items-center justify-center"
              title={`Skip (${skipVotes.votes}/${skipVotes.required} votes)`}
            >
              <div className="flex items-center space-x-1">
                <i className="fas fa-forward text-xs"></i>
                <span className="text-xs">{skipVotes.votes}/{skipVotes.required}</span>
              </div>
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center text-slate-400 py-2 flex-1">
          <i className="fas fa-music text-lg mr-2"></i>
          No song playing
        </div>
      )}
    </div>
  );
}