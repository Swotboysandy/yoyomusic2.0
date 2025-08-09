# Overview

This is a collaborative music streaming application built with React, Express, and WebSocket technology. The application allows users to create and join music rooms where they can search for songs, add them to a shared queue, and listen together in real-time. It features a modern user interface with shadcn/ui components and supports real-time chat, user presence, and synchronized playback controls.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Real-time Communication**: Native WebSocket client with custom hooks for connection management

## Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Real-time Communication**: WebSocket server using the 'ws' library for live features like chat, queue updates, and user presence
- **API Design**: RESTful endpoints for room management and HTTP API combined with WebSocket events for real-time features
- **Session Management**: In-memory storage implementation with interfaces for future database integration
- **Development Tools**: Vite middleware integration for hot module replacement in development

## Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Design**: Relational schema with tables for users, rooms, queue items, room users, chat messages, and skip votes
- **Current Implementation**: In-memory storage for development with database schema ready for production deployment

## Authentication and Authorization
- **User System**: Simple username-based identification (ready for expansion to full authentication)
- **Room Access Control**: Optional password protection for private rooms
- **Session Management**: WebSocket connection tracking with user-to-connection mapping

## External Dependencies
- **Music Search**: yt-dlp integration for YouTube music search and metadata extraction
- **Audio Processing**: Spawn child processes for yt-dlp operations
- **Development Environment**: Replit-specific tooling and plugins for cloud development
- **UI Libraries**: Comprehensive Radix UI component set for accessible, interactive components

## Key Features
- **Real-time Collaboration**: Synchronized music playback across all room participants
- **Music Discovery**: YouTube search integration with metadata extraction
- **Social Features**: Live chat, user presence indicators, and typing status
- **Queue Management**: Collaborative playlist with add/remove capabilities and vote-to-skip functionality
- **Room Management**: Create/join rooms with optional password protection
- **Responsive Design**: Mobile-first design with adaptive layouts

## Design Patterns
- **Component Architecture**: Modular React components with clear separation of concerns
- **Custom Hooks**: Reusable logic for WebSocket connections, mobile detection, and toast notifications
- **Event-Driven Communication**: WebSocket message routing with type-safe message handling
- **Storage Abstraction**: Interface-based storage system allowing easy switching between in-memory and database implementations