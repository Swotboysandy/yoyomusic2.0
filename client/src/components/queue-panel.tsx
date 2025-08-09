interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  duration: number;
  addedBy: string;
  thumbnail?: string;
  channel?: string;
}

interface QueuePanelProps {
  queue: QueueItem[];
}

export default function QueuePanel({ queue }: QueuePanelProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Queue</h3>
        <span className="text-sm text-gray-400">{queue.length} songs</span>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {queue.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <i className="fas fa-list-ul text-2xl mb-2"></i>
            <p>Queue is empty</p>
            <p className="text-sm text-gray-500">Search and add songs to get started</p>
          </div>
        ) : (
          queue.map((song, index) => (
            <div key={song.id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
              <div className="w-6 h-6 bg-gray-600 rounded text-xs flex items-center justify-center text-gray-300 font-medium">
                {index + 1}
              </div>
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-600 flex items-center justify-center">
                {song.thumbnail ? (
                  <img 
                    src={song.thumbnail} 
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fas fa-music text-sm text-gray-300"></i>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1 text-white">{song.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-400 line-clamp-1">{song.channel || 'Unknown'}</p>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <p className="text-xs text-gray-400">{formatDuration(song.duration)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
