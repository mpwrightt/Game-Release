# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Video Game Release Tracker built with Next.js 15, Convex (real-time database), and RAWG API for game data.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack on http://localhost:3000
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run Next.js linting

### Convex Development
- `npx convex dev` - Start Convex development server (required for watchlist)
- Run this in a separate terminal alongside `npm run dev`

## Architecture Overview

### Tech Stack
- **Next.js 15** with App Router and Turbopack
- **Convex** for real-time database (watchlist storage)
- **RAWG API** for game data (covers, platforms, ratings, release dates)
- **TailwindCSS v4** with shadcn/ui components
- **TypeScript** throughout

### Key Architectural Patterns

#### Data Flow
1. Game data fetched from RAWG API via `/api/games` route
2. Watchlist stored in Convex (real-time sync)
3. UI uses custom `useGames` hook for fetching with pagination
4. Game details fetched on-demand when modal opens

#### Database Architecture (Convex)
- `games` table: Cached game data from RAWG
- `watchlist` table: User's saved games to track
- All operations in `convex/games.ts` and `convex/watchlist.ts`

### Project Structure
```
app/
├── api/games/        # RAWG API proxy routes
│   ├── route.ts      # List/search games
│   └── [id]/route.ts # Single game details
├── page.tsx          # Main releases page
├── layout.tsx        # Root layout with providers
└── globals.css       # Global styles

components/
├── ui/               # shadcn/ui components
├── game-card.tsx     # Game card with watchlist toggle
├── game-grid.tsx     # Responsive game grid
└── game-details-dialog.tsx  # Game details modal

convex/
├── schema.ts         # Database schema
├── games.ts          # Game queries/mutations
└── watchlist.ts      # Watchlist operations

hooks/
└── use-games.ts      # Game fetching with pagination

lib/
├── types.ts          # TypeScript interfaces
└── utils.ts          # Utility functions
```

## Key Integration Points

### Environment Variables Required
- `RAWG_API_KEY` - Get free at https://rawg.io/apidocs
- `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` (auto-set by `npx convex dev`)

### RAWG API
- Base URL: `https://api.rawg.io/api`
- Free tier: 20,000 requests/month
- Used for: game search, upcoming releases, game details

### Convex Queries/Mutations
- `watchlist.list` - Get all watchlist items
- `watchlist.add` / `watchlist.remove` - Manage watchlist
- `watchlist.isInWatchlist` - Check if game is saved
- `games.upcoming` / `games.recentlyReleased` - Cached game queries

## Shadcn Component Installation
When installing shadcn/ui components:
- Use `bunx --bun shadcn@latest add [component-name]`
- Multiple: `bunx --bun shadcn@latest add button card dialog`
