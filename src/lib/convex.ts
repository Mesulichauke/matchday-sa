import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL?.trim();

export const convex = new ConvexReactClient(convexUrl || "http://127.0.0.1:3210");
