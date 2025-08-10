import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// --- New imports for WS + DB ---
import { WebSocketServer } from "ws";
import { db } from "./storage"; // Drizzle DB connection
import { users, roomUsers, chatMessages } from "../shared/schema";
import { eq } from "drizzle-orm";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // --- ADD WEBSOCKET SERVER HERE ---
  const wss = new WebSocketServer({ server });

  function broadcastToRoom(roomId: string, message: any) {
    wss.clients.forEach((client: any) => {
      if (client.readyState === 1 && client.roomId === roomId) {
        client.send(JSON.stringify(message));
      }
    });
  }

  async function handleJoinRoom(ws: any, { roomId, userId }: any) {
    ws.roomId = roomId;
    ws.userId = userId;

    await db.insert(roomUsers).values({ roomId, userId });

    const usersInRoom = await db
      .select({
        id: roomUsers.userId,
        username: users.username,
        joinedAt: roomUsers.joinedAt,
        isTyping: roomUsers.isTyping,
      })
      .from(roomUsers)
      .innerJoin(users, eq(roomUsers.userId, users.id))
      .where(eq(roomUsers.roomId, roomId));

    broadcastToRoom(roomId, {
      type: "room_users",
      data: usersInRoom,
    });
  }

  async function handleChatMessage(ws: any, { text }: any) {
    if (!ws.userId || !ws.roomId) return;

    const [user] = await db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(eq(users.id, ws.userId));

    await db.insert(chatMessages).values({
      roomId: ws.roomId,
      userId: ws.userId,
      message: text,
    });

    broadcastToRoom(ws.roomId, {
      type: "chat_message",
      data: {
        userId: ws.userId,
        username: user.username,
        message: text,
        sentAt: new Date().toISOString(),
      },
    });
  }

  async function handleUserTyping(ws: any, { isTyping }: any) {
    if (!ws.userId || !ws.roomId) return;

    const [user] = await db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(eq(users.id, ws.userId));

    await db
      .update(roomUsers)
      .set({ isTyping })
      .where(eq(roomUsers.userId, ws.userId));

    broadcastToRoom(ws.roomId, {
      type: "user_typing",
      data: {
        userId: ws.userId,
        username: user.username,
        isTyping,
      },
    });
  }

  wss.on("connection", (ws) => {
    ws.on("message", async (raw: any) => {
      const msg = JSON.parse(raw);
      switch (msg.type) {
        case "join_room":
          await handleJoinRoom(ws, msg.data);
          break;
        case "chat_message":
          await handleChatMessage(ws, msg.data);
          break;
        case "user_typing":
          await handleUserTyping(ws, msg.data);
          break;
      }
    });
  });
  // --- END WEBSOCKET CODE ---

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
