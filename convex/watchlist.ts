import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to get current user ID from Clerk
async function getUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject; // Clerk user ID
}

// Get all watchlist items for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("watchlist")
      .withIndex("byUserId", q => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get watchlist items sorted by release date
export const byReleaseDate = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return { upcoming: [], released: [] };
    
    const items = await ctx.db
      .query("watchlist")
      .withIndex("byUserId", q => q.eq("userId", userId))
      .collect();
    
    // Separate into upcoming and released
    const today = new Date().toISOString().split('T')[0];
    const upcoming = items.filter(item => 
      item.releaseDate && item.releaseDate >= today
    );
    const released = items.filter(item => 
      !item.releaseDate || item.releaseDate < today
    );
    
    return { upcoming, released };
  },
});

// Check if a game is in the current user's watchlist
export const isInWatchlist = query({
  args: { rawgId: v.number() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return false;
    
    const item = await ctx.db
      .query("watchlist")
      .withIndex("byUserAndRawgId", q => 
        q.eq("userId", userId).eq("rawgId", args.rawgId)
      )
      .unique();
    return item !== null;
  },
});

// Add a game to the current user's watchlist
export const add = mutation({
  args: {
    rawgId: v.number(),
    gameName: v.string(),
    backgroundImage: v.optional(v.string()),
    releaseDate: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    notify: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if already in watchlist
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("byUserAndRawgId", q => 
        q.eq("userId", userId).eq("rawgId", args.rawgId)
      )
      .unique();
    
    if (existing) {
      return existing._id; // Already in watchlist
    }
    
    return await ctx.db.insert("watchlist", {
      userId,
      rawgId: args.rawgId,
      gameName: args.gameName,
      backgroundImage: args.backgroundImage,
      releaseDate: args.releaseDate,
      platforms: args.platforms,
      addedAt: Date.now(),
      notify: args.notify ?? true,
    });
  },
});

// Remove a game from the current user's watchlist
export const remove = mutation({
  args: { rawgId: v.number() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const item = await ctx.db
      .query("watchlist")
      .withIndex("byUserAndRawgId", q => 
        q.eq("userId", userId).eq("rawgId", args.rawgId)
      )
      .unique();
    
    if (item) {
      await ctx.db.delete(item._id);
      return true;
    }
    return false;
  },
});

// Toggle notification for a watchlist item
export const toggleNotify = mutation({
  args: { rawgId: v.number() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const item = await ctx.db
      .query("watchlist")
      .withIndex("byUserAndRawgId", q => 
        q.eq("userId", userId).eq("rawgId", args.rawgId)
      )
      .unique();
    
    if (item) {
      await ctx.db.patch(item._id, { notify: !item.notify });
      return !item.notify;
    }
    return false;
  },
});

// Get count of watchlist items for current user
export const count = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return 0;
    
    const items = await ctx.db
      .query("watchlist")
      .withIndex("byUserId", q => q.eq("userId", userId))
      .collect();
    return items.length;
  },
});
