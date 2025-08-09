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
      <div className="bg-gradient-to-r from-dark-200 to-dark-100 rounded-2xl p-8 border border-gray-800/50">
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
              className="bg-dark-300 border-gray-700 text-white placeholder-gray-400"
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
              className="bg-dark-300 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleCreateRoom}
          className="mt-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-medium"
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
                className="group bg-gradient-to-br from-dark-200 to-dark-100 border-gray-800/50 hover:border-primary/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleRoomClick(room)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-xl font-bold text-white">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${room.userCount > 0 ? 'bg-primary' : 'bg-gray-500'}`}></div>
                      <span className="text-xs text-gray-400">{room.userCount} users</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-2 text-white">{room.name}</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    {room.currentSong ? `Currently playing: "${room.currentSong.title}"` : "No music playing"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-gray-500 text-sm">
                      {room.userCount === 0 ? "Ready to jam" : `${room.userCount} listening`}
                    </div>
                    <i className={`fas ${room.hasPassword ? 'fa-lock text-gray-600' : 'fa-unlock text-primary'}`}></i>
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
