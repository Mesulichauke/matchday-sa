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
      .filter((booking) => booking.status !== "cancelled" && booking.status !== "declined")
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
      v.literal("approved"),
      v.literal("paid"),
      v.literal("cancelled"),
      v.literal("declined"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return args.id;
  },
});

export const update = mutation({
  args: {
    id: v.id("bookings"),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    passengerCount: v.optional(v.number()),
    matchDate: v.optional(v.string()),
    pickupName: v.optional(v.string()),
    pickupAddress: v.optional(v.string()),
    notes: v.optional(v.string()),
    totalPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...changes } = args;
    const booking = await ctx.db.get(id);
    if (!booking) throw new Error("Booking not found.");
    await ctx.db.patch(id, changes);
    return id;
  },
});

export const assignItinerary = mutation({
  args: {
    bookingId: v.id("bookings"),
    templateId: v.optional(v.id("itineraryTemplates")),
    itinerary: v.array(v.object({
      time: v.string(),
      title: v.string(),
      location: v.string(),
      notes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found.");
    await ctx.db.patch(args.bookingId, {
      itineraryTemplateId: args.templateId,
      itinerary: args.itinerary,
    });
    return args.bookingId;
  },
});

export const listItineraryTemplates = query({
  args: {},
  handler: async (ctx) => ctx.db.query("itineraryTemplates").withIndex("by_updated_at").order("desc").collect(),
});

export const saveItineraryTemplate = mutation({
  args: {
    id: v.optional(v.id("itineraryTemplates")),
    name: v.string(),
    description: v.string(),
    items: v.array(v.object({
      time: v.string(),
      title: v.string(),
      location: v.string(),
      notes: v.optional(v.string()),
    })),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...template } = args;
    if (id) {
      await ctx.db.patch(id, { ...template, updatedAt: Date.now() });
      return id;
    }
    return ctx.db.insert("itineraryTemplates", { ...template, updatedAt: Date.now() });
  },
});

export const deleteItineraryTemplate = mutation({
  args: { id: v.id("itineraryTemplates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
