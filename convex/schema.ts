import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Games from RAWG API - cached locally for performance
  games: defineTable({
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
    lastUpdated: v.number(),
  })
    .index("byRawgId", ["rawgId"])
    .index("byReleaseDate", ["releaseDate"])
    .index("bySlug", ["slug"]),

  // User's watchlist - with Clerk userId for per-user data
  watchlist: defineTable({
    userId: v.string(),
    rawgId: v.number(),
    gameName: v.string(),
    backgroundImage: v.optional(v.string()),
    releaseDate: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    addedAt: v.number(),
    notify: v.boolean(),
  })
    .index("byUserId", ["userId"])
    .index("byUserAndRawgId", ["userId", "rawgId"])
    .index("byReleaseDate", ["releaseDate"])
    .index("byAddedAt", ["addedAt"]),
});