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
    <div className="bg-gray-800/90 rounded-2xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Now Playing</h3>
        <div className="flex items-center space-x-2">
          <i className="fas fa-users text-gray-400"></i>
          <span className="text-sm text-gray-400">{roomUsers.length} listeners</span>
        </div>
      </div>
      
      {currentSong ? (
        <>
          {/* Current Song Display */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center">
              {currentSong.thumbnail ? (
                <img 
                  src={currentSong.thumbnail} 
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-music text-2xl text-gray-400"></i>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg text-white line-clamp-2">{currentSong.title}</h4>
              <p className="text-sm text-gray-400 mt-1">{currentSong.channel || 'Unknown Channel'}</p>
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
              <div className="flex justify-between text-xs text-gray-400">
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
                className="p-3 text-gray-400 hover:text-white"
              >
                <i className="fas fa-step-backward text-xl"></i>
              </Button>
              
              <Button
                onClick={onPlayPause}
                className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg transform hover:scale-105 transition-all"
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="p-3 text-gray-400 hover:text-white"
              >
                <i className="fas fa-step-forward text-xl"></i>
              </Button>
              
              <Button
                onClick={onVoteSkip}
                variant="ghost"
                size="icon"
                className="p-3 text-gray-400 hover:text-red-400 flex items-center space-x-1"
              >
                <i className="fas fa-forward text-xl"></i>
                <span className="text-xs">{skipVotes.votes}/{skipVotes.required}</span>
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-music text-2xl text-gray-400"></i>
          </div>
          <p className="text-gray-400">No song is currently playing</p>
          <p className="text-sm text-gray-500 mt-1">Add songs to the queue to get started</p>
        </div>
      )}
    </div>
  );
}
