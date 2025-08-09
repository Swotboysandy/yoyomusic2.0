import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertRoomSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import { spawn } from "child_process";

interface WebSocketMessage {
  type: string;
  data?: any;
  roomId?: string;
  userId?: string;
}

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  roomId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active connections
  const connections = new Map<string, ExtendedWebSocket>();
  const userSockets = new Map<string, string>(); // userId -> connectionId

  // WebSocket connection handler
  wss.on('connection', (ws: ExtendedWebSocket) => {
    const connectionId = Math.random().toString(36).substring(2, 15);
    connections.set(connectionId, ws);

    ws.on('message', async (message: Buffer) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'join':
            await handleJoinRoom(ws, data, connectionId);
            break;
          case 'leave':
            await handleLeaveRoom(ws, data, connectionId);
            break;
          case 'search':
            await handleSearch(ws, data);
            break;
          case 'add_to_queue':
            await handleAddToQueue(ws, data);
            break;
          case 'vote_skip':
            await handleVoteSkip(ws, data);
            break;
          case 'play_pause':
            await handlePlayPause(ws, data);
            break;
          case 'seek':
            await handleSeek(ws, data);
            break;
          case 'chat_message':
            await handleChatMessage(ws, data);
            break;
          case 'typing':
            await handleTyping(ws, data);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', data: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      handleDisconnect(connectionId);
    });
  });

  async function handleJoinRoom(ws: ExtendedWebSocket, data: WebSocketMessage, connectionId: string) {
    const { roomId, userId } = data;
    if (!roomId || !userId) return;

    const room = await storage.getRoom(roomId);
    if (!room) {
      ws.send(JSON.stringify({ type: 'error', data: 'Room not found' }));
      return;
    }

    ws.userId = userId;
    ws.roomId = roomId;
    userSockets.set(userId, connectionId);

    await storage.addUserToRoom(roomId, userId);
    
    // Send current room state
    const [queue, roomUsers, chatMessages] = await Promise.all([
      storage.getQueueByRoom(roomId),
      storage.getRoomUsers(roomId),
      storage.getChatMessages(roomId)
    ]);

    ws.send(JSON.stringify({
      type: 'room_state',
      data: {
        room,
        queue,
        roomUsers,
        chatMessages
      }
    }));

    // Notify other users
    broadcastToRoom(roomId, {
      type: 'user_joined',
      data: { userId }
    }, userId);

    broadcastToRoom(roomId, {
      type: 'room_users_updated',
      data: await getRoomUsersWithDetails(roomId)
    });
  }

  async function handleLeaveRoom(ws: ExtendedWebSocket, data: WebSocketMessage, connectionId: string) {
    if (!ws.userId || !ws.roomId) return;

    await storage.removeUserFromRoom(ws.roomId, ws.userId);
    
    broadcastToRoom(ws.roomId, {
      type: 'user_left',
      data: { userId: ws.userId }
    }, ws.userId);

    broadcastToRoom(ws.roomId, {
      type: 'room_users_updated',
      data: await getRoomUsersWithDetails(ws.roomId)
    });

    userSockets.delete(ws.userId);
    ws.userId = undefined;
    ws.roomId = undefined;
  }

  async function handleSearch(ws: ExtendedWebSocket, data: WebSocketMessage) {
    const { query } = data.data;
    if (!query) return;

    ws.send(JSON.stringify({ type: 'search_loading', data: true }));

    try {
      const results = await searchYoutube(query);
      ws.send(JSON.stringify({ type: 'search_results', data: results }));
    } catch (error) {
      ws.send(JSON.stringify({ type: 'search_error', data: 'Search failed' }));
    }

    ws.send(JSON.stringify({ type: 'search_loading', data: false }));
  }

  async function handleAddToQueue(ws: ExtendedWebSocket, data: WebSocketMessage) {
    if (!ws.roomId || !ws.userId) return;

    const { videoId, title, duration } = data.data;
    
    const queueItem = await storage.addToQueue({
      roomId: ws.roomId,
      videoId,
      title,
      duration,
      addedBy: ws.userId
    });

    const queue = await storage.getQueueByRoom(ws.roomId);
    broadcastToRoom(ws.roomId, {
      type: 'queue_updated',
      data: queue
    });

    // If no song is playing, start the first song
    const room = await storage.getRoom(ws.roomId);
    if (!room?.currentSong && queue.length > 0) {
      await playNextSong(ws.roomId);
    }
  }

  async function handleVoteSkip(ws: ExtendedWebSocket, data: WebSocketMessage) {
    if (!ws.roomId || !ws.userId) return;

    const room = await storage.getRoom(ws.roomId);
    if (!room?.currentSong) return;

    await storage.addSkipVote(ws.roomId, ws.userId, room.currentSong.id);
    
    const [skipVotes, roomUsers] = await Promise.all([
      storage.getSkipVotes(ws.roomId, room.currentSong.id),
      storage.getRoomUsers(ws.roomId)
    ]);

    const requiredVotes = Math.ceil(roomUsers.length / 2);
    
    broadcastToRoom(ws.roomId, {
      type: 'skip_votes_updated',
      data: { votes: skipVotes.length, required: requiredVotes }
    });

    if (skipVotes.length >= requiredVotes) {
      await playNextSong(ws.roomId);
    }
  }

  async function handlePlayPause(ws: ExtendedWebSocket, data: WebSocketMessage) {
    if (!ws.roomId) return;

    const room = await storage.getRoom(ws.roomId);
    if (!room) return;

    const updatedRoom = await storage.updateRoom(ws.roomId, {
      isPlaying: !room.isPlaying
    });

    broadcastToRoom(ws.roomId, {
      type: 'playback_state_changed',
      data: { isPlaying: updatedRoom?.isPlaying, currentTime: updatedRoom?.currentTime }
    });
  }

  async function handleSeek(ws: ExtendedWebSocket, data: WebSocketMessage) {
    if (!ws.roomId) return;

    const { time } = data.data;
    
    const updatedRoom = await storage.updateRoom(ws.roomId, {
      currentTime: time
    });

    broadcastToRoom(ws.roomId, {
      type: 'seek_updated',
      data: { currentTime: time }
    });
  }

  async function handleChatMessage(ws: ExtendedWebSocket, data: WebSocketMessage) {
    if (!ws.roomId || !ws.userId) return;

    const message = await storage.addChatMessage({
      roomId: ws.roomId,
      userId: ws.userId,
      message: data.data.message
    });

    const user = await storage.getUser(ws.userId);
    
    broadcastToRoom(ws.roomId, {
      type: 'chat_message',
      data: { ...message, user }
    });
  }

  async function handleTyping(ws: ExtendedWebSocket, data: WebSocketMessage) {
    if (!ws.roomId || !ws.userId) return;

    const { isTyping } = data.data;
    await storage.updateUserTyping(ws.roomId, ws.userId, isTyping);

    const user = await storage.getUser(ws.userId);
    
    broadcastToRoom(ws.roomId, {
      type: 'user_typing',
      data: { userId: ws.userId, isTyping, username: user?.username }
    }, ws.userId);
  }

  async function handleDisconnect(connectionId: string) {
    const ws = connections.get(connectionId);
    if (!ws) return;

    if (ws.userId && ws.roomId) {
      await storage.removeUserFromRoom(ws.roomId, ws.userId);
      
      broadcastToRoom(ws.roomId, {
        type: 'user_left',
        data: { userId: ws.userId }
      }, ws.userId);

      broadcastToRoom(ws.roomId, {
        type: 'room_users_updated',
        data: await getRoomUsersWithDetails(ws.roomId)
      });

      userSockets.delete(ws.userId);
    }

    connections.delete(connectionId);
  }

  async function playNextSong(roomId: string) {
    const queue = await storage.getQueueByRoom(roomId);
    
    if (queue.length === 0) {
      await storage.updateRoom(roomId, {
        currentSong: null,
        isPlaying: false,
        currentTime: 0
      });

      broadcastToRoom(roomId, {
        type: 'song_ended',
        data: null
      });
      return;
    }

    const nextSong = queue[0];
    await storage.removeFromQueue(nextSong.id);
    
    await storage.updateRoom(roomId, {
      currentSong: {
        id: nextSong.id,
        title: nextSong.title,
        duration: nextSong.duration,
        addedBy: nextSong.addedBy,
        videoId: nextSong.videoId
      },
      isPlaying: true,
      currentTime: 0
    });

    // Clear skip votes for previous song
    await storage.clearSkipVotes(roomId, nextSong.id);

    const updatedQueue = await storage.getQueueByRoom(roomId);
    const room = await storage.getRoom(roomId);

    broadcastToRoom(roomId, {
      type: 'song_changed',
      data: { currentSong: room?.currentSong, queue: updatedQueue }
    });
  }

  async function getRoomUsersWithDetails(roomId: string) {
    const roomUsers = await storage.getRoomUsers(roomId);
    const usersWithDetails = await Promise.all(
      roomUsers.map(async (ru) => {
        const user = await storage.getUser(ru.userId);
        return { ...ru, user };
      })
    );
    return usersWithDetails;
  }

  function broadcastToRoom(roomId: string, message: WebSocketMessage, excludeUserId?: string) {
    connections.forEach((ws) => {
      if (ws.roomId === roomId && ws.userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  async function searchYoutube(query: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const ytdlp = spawn('yt-dlp', [
        '--quiet',
        '--flat-playlist',
        '--dump-json',
        `ytsearch5:${query}`
      ]);

      let output = '';
      let errorOutput = '';

      ytdlp.stdout.on('data', (data) => {
        output += data.toString();
      });

      ytdlp.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ytdlp.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`yt-dlp failed: ${errorOutput}`));
          return;
        }

        try {
          const lines = output.trim().split('\n').filter(line => line);
          const results = lines.map(line => {
            const data = JSON.parse(line);
            return {
              id: data.id,
              title: data.title,
              duration: data.duration || 0,
              videoId: data.id
            };
          });
          resolve(results);
        } catch (error) {
          reject(new Error('Failed to parse search results'));
        }
      });
    });
  }

  // REST API routes
  app.get('/api/rooms', async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      const roomsWithUserCount = await Promise.all(
        rooms.map(async (room) => {
          const users = await storage.getRoomUsers(room.id);
          return {
            ...room,
            userCount: users.length,
            hasPassword: !!room.password
          };
        })
      );
      res.json(roomsWithUserCount);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch rooms' });
    }
  });

  app.post('/api/rooms', async (req, res) => {
    try {
      const { name, password } = insertRoomSchema.parse(req.body);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID required' });
      }

      const room = await storage.createRoom({ name, password, createdBy: userId });
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: 'Invalid room data' });
    }
  });

  app.post('/api/rooms/:id/join', async (req, res) => {
    try {
      const { id } = req.params;
      const { password, userId } = req.body;

      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      if (room.password && room.password !== password) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to join room' });
    }
  });

  return httpServer;
}
