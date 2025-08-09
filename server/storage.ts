import { 
  type User, 
  type InsertUser, 
  type Room, 
  type InsertRoom,
  type QueueItem,
  type InsertQueueItem,
  type RoomUser,
  type ChatMessage,
  type InsertChatMessage,
  type SkipVote
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Room methods
  getRoom(id: string): Promise<Room | undefined>;
  getRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom & { createdBy: string }): Promise<Room>;
  updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined>;
  
  // Queue methods
  getQueueByRoom(roomId: string): Promise<QueueItem[]>;
  addToQueue(item: InsertQueueItem & { addedBy: string }): Promise<QueueItem>;
  removeFromQueue(id: string): Promise<boolean>;
  clearQueue(roomId: string): Promise<boolean>;
  
  // Room users methods
  getRoomUsers(roomId: string): Promise<RoomUser[]>;
  addUserToRoom(roomId: string, userId: string): Promise<RoomUser>;
  removeUserFromRoom(roomId: string, userId: string): Promise<boolean>;
  updateUserTyping(roomId: string, userId: string, isTyping: boolean): Promise<boolean>;
  
  // Chat methods
  getChatMessages(roomId: string): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage & { userId: string }): Promise<ChatMessage>;
  
  // Skip votes methods
  getSkipVotes(roomId: string, songId: string): Promise<SkipVote[]>;
  addSkipVote(roomId: string, userId: string, songId: string): Promise<SkipVote>;
  clearSkipVotes(roomId: string, songId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rooms: Map<string, Room>;
  private queueItems: Map<string, QueueItem>;
  private roomUsers: Map<string, RoomUser>;
  private chatMessages: Map<string, ChatMessage>;
  private skipVotes: Map<string, SkipVote>;

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.queueItems = new Map();
    this.roomUsers = new Map();
    this.chatMessages = new Map();
    this.skipVotes = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async createRoom(room: InsertRoom & { createdBy: string }): Promise<Room> {
    const id = randomUUID();
    const newRoom: Room = {
      id,
      name: room.name,
      password: room.password || null,
      createdBy: room.createdBy,
      createdAt: new Date(),
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
    };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async getQueueByRoom(roomId: string): Promise<QueueItem[]> {
    return Array.from(this.queueItems.values())
      .filter(item => item.roomId === roomId)
      .sort((a, b) => a.position - b.position);
  }

  async addToQueue(item: InsertQueueItem & { addedBy: string }): Promise<QueueItem> {
    const id = randomUUID();
    const existingItems = await this.getQueueByRoom(item.roomId);
    const position = existingItems.length;
    
    const queueItem: QueueItem = {
      id,
      roomId: item.roomId,
      videoId: item.videoId,
      title: item.title,
      duration: item.duration,
      addedBy: item.addedBy,
      addedAt: new Date(),
      position,
    };
    
    this.queueItems.set(id, queueItem);
    return queueItem;
  }

  async removeFromQueue(id: string): Promise<boolean> {
    return this.queueItems.delete(id);
  }

  async clearQueue(roomId: string): Promise<boolean> {
    const items = Array.from(this.queueItems.values()).filter(item => item.roomId === roomId);
    items.forEach(item => this.queueItems.delete(item.id));
    return true;
  }

  async getRoomUsers(roomId: string): Promise<RoomUser[]> {
    return Array.from(this.roomUsers.values())
      .filter(ru => ru.roomId === roomId);
  }

  async addUserToRoom(roomId: string, userId: string): Promise<RoomUser> {
    const id = randomUUID();
    const roomUser: RoomUser = {
      id,
      roomId,
      userId,
      joinedAt: new Date(),
      isTyping: false,
      lastActivity: new Date(),
    };
    this.roomUsers.set(id, roomUser);
    return roomUser;
  }

  async removeUserFromRoom(roomId: string, userId: string): Promise<boolean> {
    const roomUser = Array.from(this.roomUsers.values())
      .find(ru => ru.roomId === roomId && ru.userId === userId);
    
    if (roomUser) {
      return this.roomUsers.delete(roomUser.id);
    }
    return false;
  }

  async updateUserTyping(roomId: string, userId: string, isTyping: boolean): Promise<boolean> {
    const roomUser = Array.from(this.roomUsers.values())
      .find(ru => ru.roomId === roomId && ru.userId === userId);
    
    if (roomUser) {
      roomUser.isTyping = isTyping;
      roomUser.lastActivity = new Date();
      this.roomUsers.set(roomUser.id, roomUser);
      return true;
    }
    return false;
  }

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.roomId === roomId)
      .sort((a, b) => a.sentAt!.getTime() - b.sentAt!.getTime());
  }

  async addChatMessage(message: InsertChatMessage & { userId: string }): Promise<ChatMessage> {
    const id = randomUUID();
    const chatMessage: ChatMessage = {
      id,
      roomId: message.roomId,
      userId: message.userId,
      message: message.message,
      sentAt: new Date(),
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async getSkipVotes(roomId: string, songId: string): Promise<SkipVote[]> {
    return Array.from(this.skipVotes.values())
      .filter(vote => vote.roomId === roomId && vote.songId === songId);
  }

  async addSkipVote(roomId: string, userId: string, songId: string): Promise<SkipVote> {
    const id = randomUUID();
    const skipVote: SkipVote = {
      id,
      roomId,
      userId,
      songId,
      votedAt: new Date(),
    };
    this.skipVotes.set(id, skipVote);
    return skipVote;
  }

  async clearSkipVotes(roomId: string, songId: string): Promise<boolean> {
    const votes = Array.from(this.skipVotes.values())
      .filter(vote => vote.roomId === roomId && vote.songId === songId);
    
    votes.forEach(vote => this.skipVotes.delete(vote.id));
    return true;
  }
}

export const storage = new MemStorage();
