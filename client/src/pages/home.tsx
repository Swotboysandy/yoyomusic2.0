import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import RoomSelection from "@/components/room-selection";
import MusicRoom from "@/components/music-room";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { id: roomId } = useParams();
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [currentView, setCurrentView] = useState<'selection' | 'room'>('selection');
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    // Check if user already exists in localStorage
    const savedUser = localStorage.getItem('musicAppUser');
    if (savedUser && !currentUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else if (!currentUser && !savedUser) {
      // Show username input if no user exists
      const username = prompt('Enter your username:');
      if (username && username.trim()) {
        const user = {
          id: Math.random().toString(36).substring(2, 15),
          username: username.trim()
        };
        setCurrentUser(user);
        localStorage.setItem('musicAppUser', JSON.stringify(user));
      }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Navigation Header */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="fas fa-music text-white text-sm"></i>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  YoYoMusic 2.0
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-orange-400 animate-pulse shadow-orange-400/50 shadow-lg' : 'bg-gray-500'}`}></div>
                <span className="text-sm font-medium text-slate-200">{currentUser.username}</span>
              </div>
              {currentView === 'room' && (
                <Button
                  onClick={() => setLocation('/')}
                  variant="outline"
                  className="text-white border-slate-600 hover:bg-red-500/20 hover:border-red-500"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Exit Room
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {currentView === 'selection' ? (
          <RoomSelection currentUser={currentUser} socket={socket} />
        ) : roomId ? (
          <MusicRoom roomId={roomId} currentUser={currentUser} socket={socket} />
        ) : null}
      </main>
    </div>
  );
}
