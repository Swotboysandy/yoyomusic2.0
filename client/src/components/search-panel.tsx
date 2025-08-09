import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchResult {
  id: string;
  title: string;
  duration: number;
  videoId: string;
  thumbnail?: string;
  channel?: string;
}

interface SearchPanelProps {
  searchResults: SearchResult[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onAddToQueue: (song: SearchResult) => void;
}

export default function SearchPanel({ searchResults, isSearching, onSearch, onAddToQueue }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl shadow-orange-500/10">
      <h3 className="text-lg font-bold mb-4 text-white">Add Music</h3>
      
      <div className="flex space-x-3 mb-4">
        <Input
          placeholder="Search for songs, artists, or albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 font-medium"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg font-medium"
        >
          {isSearching ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-search"></i>
          )}
        </Button>
      </div>
      
      {/* Search Results */}
      <div className="space-y-2">
        {searchResults.length === 0 && !isSearching && searchQuery && (
          <div className="text-center text-gray-400 py-4">
            No results found. Try a different search term.
          </div>
        )}
        
        {searchResults.map((result) => (
          <div
            key={result.id}
            className="flex items-center justify-between p-3 bg-slate-800/30 rounded-2xl hover:bg-slate-800/50 transition-all duration-300 border border-slate-700/30"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center shadow-lg">
                {result.thumbnail ? (
                  <img 
                    src={result.thumbnail} 
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fas fa-music text-sm text-white"></i>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm line-clamp-2">{result.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs font-medium text-slate-400">{result.channel || 'Unknown'}</p>
                  <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                  <p className="text-xs text-slate-400">{formatDuration(result.duration)}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => onAddToQueue(result)}
              className="ml-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 py-1 text-sm font-medium shadow-lg"
            >
              <i className="fas fa-plus mr-1"></i>
              Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
