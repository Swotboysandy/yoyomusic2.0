import { useState, useEffect } from "react";
import { useParams } from "wouter";
import RoomSelection from "@/components/room-selection";
import MusicRoom from "@/components/music-room";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Home() {
  const { id: roomId } = useParams();
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [currentView, setCurrentView] = useState<'selection' | 'room'>('selection');
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    // Generate a temporary user for demo purposes
    if (!currentUser) {
      setCurrentUser({
        id: Math.random().toString(36).substring(2, 15),
        username: `User${Math.floor(Math.random() * 1000)}`
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (roomId && currentUser) {
      setCurrentView('room');
    } else {
      setCurrentView('selection');
    }
  }, [roomId, currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Header */}
      <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <i className="fas fa-music text-white text-sm"></i>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  SyncTunes
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-sm text-gray-300">{currentUser.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'selection' ? (
          <RoomSelection currentUser={currentUser} socket={socket} />
        ) : roomId ? (
          <MusicRoom roomId={roomId} currentUser={currentUser} socket={socket} />
        ) : null}
      </main>
    </div>
  );
}
