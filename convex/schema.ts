import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bookings: defineTable({
    matchId: v.string(),
    matchTitle: v.string(),
    team: v.string(),
    opponent: v.string(),
    venue: v.string(),
    matchDate: v.string(),
    packageId: v.optional(v.string()),
    packageTitle: v.string(),
    packagePrice: v.number(),
    pickupName: v.string(),
    pickupAddress: v.string(),
    pickupProvince: v.string(),
    pickupZone: v.string(),
    tripGroupId: v.optional(v.string()),
    tripRegions: v.optional(v.array(v.string())),
    passengerCount: v.number(),
    includeTicket: v.boolean(),
    ticketTotal: v.number(),
    totalPrice: v.number(),
    paymentMethod: v.union(v.literal("full"), v.literal("bnpl")),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("cancelled"),
    ),
    createdAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_status", ["status"])
    .index("by_match_package", ["matchId", "packageId"])
    .index("by_trip_group", ["tripGroupId"]),
});
