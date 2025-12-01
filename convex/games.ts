import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all cached games, optionally filtered by platform
export const list = query({
  args: {
    platform: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let gamesQuery = ctx.db.query("games").order("desc");
    
    const games = await gamesQuery.take(args.limit ?? 50);
    
    if (args.platform) {
      return games.filter(game => 
        game.platforms?.some(p => 
          p.toLowerCase().includes(args.platform!.toLowerCase())
        )
      );
    }
    
    return games;
  },
});

// Get upcoming games (release date in the future)
export const upcoming = query({
  args: {
    platform: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    const games = await ctx.db
      .query("games")
      .withIndex("byReleaseDate")
      .order("asc")
      .take(200);
    
    let filtered = games.filter(game => 
      game.releaseDate && game.releaseDate >= today
    );
    
    if (args.platform) {
      filtered = filtered.filter(game =>
        game.platforms?.some(p =>
          p.toLowerCase().includes(args.platform!.toLowerCase())
        )
      );
    }
    
    return filtered.slice(0, args.limit ?? 50);
  },
});

// Get recently released games
export const recentlyReleased = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    const games = await ctx.db
      .query("games")
      .withIndex("byReleaseDate")
      .order("desc")
      .take(200);
    
    return games
      .filter(game => 
        game.releaseDate && 
        game.releaseDate <= today && 
        game.releaseDate >= thirtyDaysAgo
      )
      .slice(0, args.limit ?? 20);
  },
});

// Get a single game by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .withIndex("bySlug", q => q.eq("slug", args.slug))
      .unique();
  },
});

// Get a single game by RAWG ID
export const getByRawgId = query({
  args: { rawgId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .withIndex("byRawgId", q => q.eq("rawgId", args.rawgId))
      .unique();
  },
});

// Upsert a game (insert or update)
export const upsert = mutation({
  args: {
    rawgId: v.number(),
    name: v.string(),
    slug: v.string(),
    backgroundImage: v.optional(v.string()),
    releaseDate: v.optional(v.string()),
    released: v.optional(v.string()),
    metacritic: v.optional(v.number()),
    rating: v.optional(v.number()),
    platforms: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("games")
      .withIndex("byRawgId", q => q.eq("rawgId", args.rawgId))
      .unique();
    
    const gameData = {
      ...args,
      lastUpdated: Date.now(),
    };
    
    if (existing) {
      await ctx.db.patch(existing._id, gameData);
      return existing._id;
    } else {
      return await ctx.db.insert("games", gameData);
    }
  },
});

// Bulk upsert games
export const bulkUpsert = mutation({
  args: {
    games: v.array(v.object({
      rawgId: v.number(),
      name: v.string(),
      slug: v.string(),
      backgroundImage: v.optional(v.string()),
      releaseDate: v.optional(v.string()),
      released: v.optional(v.string()),
      metacritic: v.optional(v.number()),
      rating: v.optional(v.number()),
      platforms: v.optional(v.array(v.string())),
      genres: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const game of args.games) {
      const existing = await ctx.db
        .query("games")
        .withIndex("byRawgId", q => q.eq("rawgId", game.rawgId))
        .unique();
      
      const gameData = {
        ...game,
        lastUpdated: Date.now(),
      };
      
      if (existing) {
        await ctx.db.patch(existing._id, gameData);
        results.push(existing._id);
      } else {
        const id = await ctx.db.insert("games", gameData);
        results.push(id);
      }
    }
    return results;
  },
});
