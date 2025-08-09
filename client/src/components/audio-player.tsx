import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import YouTubePlayer from "./youtube-player";

interface Song {
  id: string;
  title: string;
  duration: number;
  addedBy: string;
  videoId: string;
  thumbnail?: string;
  channel?: string;
}

interface RoomUser {
  id: string;
  userId: string;
  user?: { username: string };
}

interface AudioPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  skipVotes: { votes: number; required: number };
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

  const progress = currentSong ? (currentTime / currentSong.duration) * 100 : 0;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-2xl shadow-orange-500/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Now Playing</h3>
        <div className="flex items-center space-x-2">
          <i className="fas fa-users text-slate-300"></i>
          <span className="text-sm font-medium text-slate-400">{roomUsers.length} listeners</span>
        </div>
      </div>
      
      {currentSong ? (
        <>
          {/* Current Song Display */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center shadow-lg">
              {currentSong.thumbnail ? (
                <img 
                  src={currentSong.thumbnail} 
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-music text-2xl text-white"></i>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-white line-clamp-2">{currentSong.title}</h4>
              <p className="text-sm font-medium text-slate-400 mt-1">{currentSong.channel || 'Unknown Channel'}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  Added by {roomUsers.find(u => u.userId === currentSong.addedBy)?.user?.username || 'Unknown'}
                </span>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-gray-500">{formatTime(currentSong.duration)}</span>
              </div>
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
          
          {/* Audio Controls */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentSong.duration)}</span>
              </div>
              <Slider
                value={[currentTime]}
                max={currentSong.duration}
                step={1}
                onValueChange={([value]) => onSeek(value)}
                className="w-full"
              />
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-center space-x-6">
              <Button
                variant="ghost"
                size="icon"
                className="p-3 text-white hover:text-slate-200"
              >
                <i className="fas fa-step-backward text-xl text-white"></i>
              </Button>
              
              <Button
                onClick={onPlayPause}
                className="p-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 rounded-full text-white shadow-2xl shadow-purple-500/30 transform hover:scale-110 transition-all duration-300"
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="p-3 text-white hover:text-slate-200"
              >
                <i className="fas fa-step-forward text-xl text-white"></i>
              </Button>
              
              <Button
                onClick={onVoteSkip}
                variant="ghost"
                size="icon"
                className="p-3 text-white hover:text-orange-400 hover:bg-orange-500/20 rounded-full transition-all duration-300 flex items-center space-x-1"
              >
                <i className="fas fa-forward text-xl text-white"></i>
                <span className="text-xs">{skipVotes.votes}/{skipVotes.required}</span>
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-music text-2xl text-white"></i>
          </div>
          <p className="text-slate-300">No song is currently playing</p>
          <p className="text-sm text-slate-400 mt-1">Add songs to the queue to get started</p>
        </div>
      )}
    </div>
  );
}
