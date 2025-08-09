# SyncTunes - Collaborative Music Streaming App

A real-time collaborative music streaming platform built with React, Express, and WebSocket technology.

## Features

- 🎵 Real-time collaborative music playback
- 🔍 YouTube music search and streaming
- 💬 Live chat with typing indicators
- 👥 User presence and room management
- 🎛️ Vote-to-skip functionality
- 🔒 Password-protected rooms
- 📱 Responsive design with mobile support
- 🌈 Animated gradient background theme

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd synctunes
```

2. **Install dependencies:**
```bash
npm install
```

3. **Install yt-dlp (required for YouTube music):**

**On macOS:**
```bash
brew install yt-dlp
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install yt-dlp
```

**On Windows:**
- Download from https://github.com/yt-dlp/yt-dlp/releases
- Add to your PATH

4. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
```

5. **Start the development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### Current Scripts Available:
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and stores
├── server/                 # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage layer
│   └── websocket.ts       # WebSocket handling
├── shared/                 # Shared TypeScript types
└── package.json
```

## Deployment

### Deploy to Render

1. **Connect your GitHub repository to Render**

2. **Create a new Web Service with these settings:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

3. **Add environment variables:**
   ```
   NODE_ENV=production
   PORT=10000
   ```

4. **Install yt-dlp on Render:**
   Add this to your build command:
   ```bash
   npm install && apt-get update && apt-get install -y yt-dlp && npm run build
   ```

### Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Configure vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ]
}
```

**Note:** Vercel has limitations with yt-dlp. For full functionality, Render is recommended.

### Deploy to Railway

1. **Connect your GitHub repository to Railway**

2. **Add environment variables:**
   ```
   NODE_ENV=production
   ```

3. **Railway will automatically detect and deploy your Node.js app**

## Production Considerations

### Database Setup

The app currently uses in-memory storage. For production, set up PostgreSQL:

1. **Add database environment variables:**
```env
DATABASE_URL=your_postgresql_connection_string
```

2. **Run database migrations:**
```bash
npm run db:migrate
```

### WebSocket Configuration

For production WebSocket support, ensure your hosting platform supports WebSocket connections:

- **Render:** Supports WebSockets ✅
- **Vercel:** Limited WebSocket support ⚠️
- **Railway:** Supports WebSockets ✅
- **Heroku:** Supports WebSockets ✅

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Express.js, TypeScript
- **Real-time:** WebSockets
- **Music:** yt-dlp, YouTube integration
- **Database:** PostgreSQL with Drizzle ORM
- **UI:** shadcn/ui components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details