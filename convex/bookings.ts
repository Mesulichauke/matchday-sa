import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bookings").order("desc").collect();
  },
});

export const forTrip = query({
  args: {
    matchId: v.string(),
    packageId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_match_package", (q) => q.eq("matchId", args.matchId).eq("packageId", args.packageId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const tripGroupId = args.tripGroupId ?? `${args.matchId}-${args.packageId ?? "package"}-${args.pickupProvince}`;
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_trip_group", (q) => q.eq("tripGroupId", tripGroupId))
      .collect();
    const reservedSeats = existingBookings
      .filter((booking) => booking.status !== "cancelled")
      .reduce((total, booking) => total + booking.passengerCount, 0);

    if (reservedSeats + args.passengerCount > 18) {
      throw new Error(`This trip group only has ${Math.max(0, 18 - reservedSeats)} seat(s) remaining.`);
    }

    const id = await ctx.db.insert("bookings", {
      ...args,
      tripGroupId,
      status: "pending",
      createdAt: Date.now(),
    });

    return id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return args.id;
  },
});
