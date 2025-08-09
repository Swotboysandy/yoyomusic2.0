import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  password: text("password"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  currentSong: json("current_song").$type<{
    id: string;
    title: string;
    duration: number;
    addedBy: string;
    videoId: string;
    thumbnail?: string;
    channel?: string;
  }>(),
  isPlaying: boolean("is_playing").default(false),
  currentTime: integer("current_time").default(0),
});

export const queueItems = pgTable("queue_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => rooms.id).notNull(),
  videoId: text("video_id").notNull(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(),
  addedBy: varchar("added_by").references(() => users.id).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
  position: integer("position").notNull(),
  thumbnail: text("thumbnail"),
  channel: text("channel"),
});

export const roomUsers = pgTable("room_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => rooms.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  isTyping: boolean("is_typing").default(false),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => rooms.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const skipVotes = pgTable("skip_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => rooms.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  songId: text("song_id").notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  name: true,
  password: true,
});

export const insertQueueItemSchema = createInsertSchema(queueItems).pick({
  roomId: true,
  videoId: true,
  title: true,
  duration: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  roomId: true,
  message: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertQueueItem = z.infer<typeof insertQueueItemSchema>;
export type QueueItem = typeof queueItems.$inferSelect;
export type RoomUser = typeof roomUsers.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type SkipVote = typeof skipVotes.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
