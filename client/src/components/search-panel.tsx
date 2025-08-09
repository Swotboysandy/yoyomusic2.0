import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchResult {
  id: string;
  title: string;
  duration: number;
  videoId: string;
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
    <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-white">Add Music</h3>
      
      <div className="flex space-x-3 mb-4">
        <Input
          placeholder="Search for songs, artists, or albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white"
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
            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                <i className="fas fa-play text-xs text-gray-300"></i>
              </div>
              <div>
                <p className="font-medium text-white">{result.title}</p>
                <p className="text-sm text-gray-400">{formatDuration(result.duration)}</p>
              </div>
            </div>
            <Button
              onClick={() => onAddToQueue(result)}
              variant="ghost"
              size="icon"
              className="p-2 text-gray-400 hover:text-primary"
            >
              <i className="fas fa-plus"></i>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
