import { useEffect, useState } from "react";
import AudioPlayer from "./audio-player";
import SearchPanel from "./search-panel";
import QueuePanel from "./queue-panel";
import ChatPanel from "./chat-panel";
import UsersPanel from "./users-panel";

interface Song {
  id: string;
  title: string;
  duration: number;
  addedBy: string;
  videoId: string;
}

interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  duration: number;
  addedBy: string;
}

interface RoomUser {
  id: string;
  userId: string;
  isTyping: boolean;
  user?: { username: string };
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  sentAt: string;
  user?: { username: string };
}

interface MusicRoomProps {
  roomId: string;
  currentUser: { id: string; username: string };
  socket: WebSocket | null;
}

export default function MusicRoom({ roomId, currentUser, socket }: MusicRoomProps) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [skipVotes, setSkipVotes] = useState({ votes: 0, required: 0 });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [userId: string]: string }>({});

  useEffect(() => {
    if (!socket) return;

    // Join the room
    socket.send(JSON.stringify({
      type: 'join',
      roomId,
      userId: currentUser.id
    }));

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'room_state':
          const { room, queue: roomQueue, roomUsers: users, chatMessages: messages } = message.data;
          setCurrentSong(room.currentSong);
          setIsPlaying(room.isPlaying);
          setCurrentTime(room.currentTime);
          setQueue(roomQueue);
          setRoomUsers(users);
          setChatMessages(messages);
          break;
          
        case 'song_changed':
          setCurrentSong(message.data.currentSong);
          setQueue(message.data.queue);
          setCurrentTime(0);
          setIsPlaying(true);
          setSkipVotes({ votes: 0, required: 0 });
          break;
          
        case 'queue_updated':
          setQueue(message.data);
          break;
          
        case 'playback_state_changed':
          setIsPlaying(message.data.isPlaying);
          setCurrentTime(message.data.currentTime);
          break;
          
        case 'seek_updated':
          setCurrentTime(message.data.currentTime);
          break;
          
        case 'room_users_updated':
          setRoomUsers(message.data);
          break;
          
        case 'chat_message':
          setChatMessages(prev => [...prev, message.data]);
          break;
          
        case 'user_typing':
          if (message.data.isTyping) {
            setTypingUsers(prev => ({ ...prev, [message.data.userId]: message.data.username }));
          } else {
            setTypingUsers(prev => {
              const updated = { ...prev };
              delete updated[message.data.userId];
              return updated;
            });
          }
          break;
          
        case 'skip_votes_updated':
          setSkipVotes(message.data);
          break;
          
        case 'search_results':
          setSearchResults(message.data);
          break;
          
        case 'search_loading':
          setIsSearching(message.data);
          break;
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
      socket.send(JSON.stringify({
        type: 'leave',
        roomId,
        userId: currentUser.id
      }));
    };
  }, [socket, roomId, currentUser.id]);

  const handleSearch = (query: string) => {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'search',
      data: { query }
    }));
  };

  const handleAddToQueue = (song: any) => {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'add_to_queue',
      data: {
        videoId: song.videoId,
        title: song.title,
        duration: song.duration
      }
    }));
  };

  const handlePlayPause = () => {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'play_pause'
    }));
  };

  const handleVoteSkip = () => {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'vote_skip'
    }));
  };

  const handleSeek = (time: number) => {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'seek',
      data: { time }
    }));
  };

  const handleSendMessage = (message: string) => {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'chat_message',
      data: { message }
    }));
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socket) return;
    socket.send(JSON.stringify({
      type: 'typing',
      data: { isTyping }
    }));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Music Player */}
      <div className="lg:col-span-2 space-y-6">
        <AudioPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          skipVotes={skipVotes}
          roomUsers={roomUsers}
          onPlayPause={handlePlayPause}
          onVoteSkip={handleVoteSkip}
          onSeek={handleSeek}
        />
        
        <SearchPanel
          searchResults={searchResults}
          isSearching={isSearching}
          onSearch={handleSearch}
          onAddToQueue={handleAddToQueue}
        />
      </div>
      
      {/* Sidebar Content */}
      <div className="space-y-6">
        <QueuePanel queue={queue} />
        <ChatPanel
          messages={chatMessages}
          currentUser={currentUser}
          typingUsers={typingUsers}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
        <UsersPanel users={roomUsers} />
      </div>
    </div>
  );
}
