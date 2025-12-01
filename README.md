# Game Release Tracker

A modern video game release tracker built with Next.js 15, Convex, and the RAWG API. Track upcoming releases, filter by platform, and build your personal watchlist.

## Features

- 🎮 **Upcoming Releases** - Browse games releasing soon with cover art, ratings, and platforms
- 🔍 **Search** - Find any game in the RAWG database
- 📅 **Recent Releases** - See what just dropped in the last 30 days
- 🎯 **Platform Filters** - Filter by PC, PlayStation, Xbox, or Nintendo
- ⭐ **Watchlist** - Save games you're interested in (stored in Convex)
- 🌗 **Dark/Light Theme** - System-aware theme switching
- 📱 **Responsive Design** - Works great on mobile and desktop

## Tech Stack

- **Next.js 15** - React framework with App Router & Turbopack
- **Convex** - Real-time database for watchlist storage
- **RAWG API** - Game data (covers, platforms, ratings, release dates)
- **TailwindCSS v4** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Lucide Icons** - Beautiful icons
- **Framer Motion** - Smooth animations

## Getting Started

### Prerequisites

- Node.js 18+
- Convex account (free at [convex.dev](https://convex.dev))
- RAWG API key (free at [rawg.io/apidocs](https://rawg.io/apidocs))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Add your RAWG API key to `.env.local`:
```bash
RAWG_API_KEY=your_rawg_api_key_here
```

4. Initialize Convex (in a separate terminal):
```bash
npx convex dev
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Project Structure

```
├── app/
│   ├── api/games/          # RAWG API routes
│   ├── page.tsx            # Main game releases page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── game-card.tsx       # Game card component
│   ├── game-grid.tsx       # Game grid layout
│   └── game-details-dialog.tsx  # Game details modal
├── convex/
│   ├── schema.ts           # Database schema (games, watchlist)
│   ├── games.ts            # Game queries/mutations
│   └── watchlist.ts        # Watchlist queries/mutations
├── hooks/
│   └── use-games.ts        # Game data fetching hooks
└── lib/
    ├── types.ts            # TypeScript types
    └── utils.ts            # Utility functions
```

## Environment Variables

### Required for .env.local
- `RAWG_API_KEY` - Your RAWG API key
- `CONVEX_DEPLOYMENT` - Auto-set by `npx convex dev`
- `NEXT_PUBLIC_CONVEX_URL` - Auto-set by `npx convex dev`

## API Endpoints

### GET /api/games
Fetch games from RAWG API.

Query params:
- `type` - `upcoming` | `recent` | `search` (default: `upcoming`)
- `platform` - `pc` | `playstation` | `xbox` | `nintendo`
- `search` - Search query string
- `page` - Page number
- `page_size` - Results per page (default: 20)

### GET /api/games/[id]
Fetch detailed info for a specific game.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
