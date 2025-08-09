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
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl shadow-purple-500/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Queue</h3>
        <span className="text-sm font-medium text-slate-400">{queue.length} songs</span>
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
            <div key={song.id} className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-2xl border border-slate-700/30">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-600 to-purple-600 rounded text-xs flex items-center justify-center text-white font-bold shadow-lg">
                {index + 1}
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center shadow-lg">
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
                <p className="font-semibold text-sm line-clamp-1 text-white">{song.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs font-medium text-slate-400 line-clamp-1">{song.channel || 'Unknown'}</p>
                  <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                  <p className="text-xs text-slate-400">{formatDuration(song.duration)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
