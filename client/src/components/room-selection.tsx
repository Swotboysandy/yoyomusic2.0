import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import PasswordModal from "./password-modal";
import { useToast } from "@/hooks/use-toast";

interface Room {
  id: string;
  name: string;
  userCount: number;
  currentSong?: { title: string } | null;
  hasPassword: boolean;
}

interface RoomSelectionProps {
  currentUser: { id: string; username: string };
  socket: WebSocket | null;
}

export default function RoomSelection({ currentUser, socket }: RoomSelectionProps) {
  const [, setLocation] = useLocation();
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { toast } = useToast();

  const { data: rooms = [], isLoading } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room name",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          password: roomPassword || null,
          userId: currentUser.id,
        }),
      });

      if (response.ok) {
        const room = await response.json();
        setLocation(`/room/${room.id}`);
      } else {
        throw new Error('Failed to create room');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    }
  };

  const handleJoinRoom = async (room: Room, password?: string) => {
    try {
      const response = await fetch(`/api/rooms/${room.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password || '',
          userId: currentUser.id,
        }),
      });

      if (response.ok) {
        setLocation(`/room/${room.id}`);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to join room",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive",
      });
    }
  };

  const handleRoomClick = (room: Room) => {
    if (room.hasPassword) {
      setSelectedRoom(room);
      setShowPasswordModal(true);
    } else {
      handleJoinRoom(room);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">Choose Your Music Room</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Join an existing room or create a new one to start sharing music with friends in real-time.
        </p>
      </div>

      {/* Create Room Section */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl shadow-orange-500/10">
        <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
          <i className="fas fa-plus-circle text-primary mr-3"></i>
          Create New Room
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="roomName" className="text-gray-300 mb-2">Room Name</Label>
            <Input
              id="roomName"
              placeholder="My Awesome Music Room"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 font-medium"
            />
          </div>
          <div>
            <Label htmlFor="roomPassword" className="text-gray-300 mb-2">Password (Optional)</Label>
            <Input
              id="roomPassword"
              type="password"
              placeholder="Enter password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 font-medium"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleCreateRoom}
          className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-lg"
        >
          <i className="fas fa-door-open mr-2"></i>
          Create Room
        </Button>
      </div>

      {/* Available Rooms */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Available Rooms</h3>
        
        {isLoading ? (
          <div className="text-center text-gray-400">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center text-gray-400">No rooms available. Create one to get started!</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, index: number) => (
              <Card
                key={room.id}
                className="group bg-slate-800/60 backdrop-blur-xl border-slate-600/50 hover:border-orange-500/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 shadow-xl"
                onClick={() => handleRoomClick(room)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${room.userCount > 0 ? 'bg-orange-400 animate-pulse shadow-orange-400/50 shadow-lg' : 'bg-gray-500'}`}></div>
                      <span className="text-xs text-slate-400">{room.userCount} users</span>
                      {room.hasPassword && (
                        <div className="text-yellow-400">
                          <i className="fas fa-lock text-sm"></i>
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-2 text-white group-hover:text-orange-400 transition-colors">{room.name}</h4>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full font-mono">
                      #{room.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  {room.currentSong ? (
                    <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/30 mb-4">
                      <p className="text-xs text-slate-400 mb-1">Currently playing:</p>
                      <p className="text-white font-medium text-sm line-clamp-1">{room.currentSong.title}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm mb-4">No music playing - ready to jam!</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-slate-500 text-sm">
                      {room.userCount === 0 ? "Join first!" : `${room.userCount} listening`}
                    </div>
                    <i className="fas fa-arrow-right text-orange-400 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedRoom(null);
        }}
        onSubmit={(password) => {
          if (selectedRoom) {
            handleJoinRoom(selectedRoom, password);
          }
          setShowPasswordModal(false);
          setSelectedRoom(null);
        }}
        roomName={selectedRoom?.name || ""}
      />
    </div>
  );
}
