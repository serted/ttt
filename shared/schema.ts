import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Trading data types
export const clusterSchema = z.object({
  price: z.number(),
  volume: z.number(),
  buyVolume: z.number(),
  sellVolume: z.number(),
  delta: z.number(),
  aggression: z.number(),
});

export const candleDataSchema = z.object({
  time: z.number(), // Unix timestamp
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  buyVolume: z.number(),
  sellVolume: z.number(),
  delta: z.number(),
  clusters: z.array(clusterSchema),
});

export const orderBookLevelSchema = z.object({
  price: z.number(),
  volume: z.number(),
});

export const orderBookDataSchema = z.object({
  bids: z.array(orderBookLevelSchema),
  asks: z.array(orderBookLevelSchema),
  lastUpdate: z.number(),
});

export const volumeProfileLevelSchema = z.object({
  price: z.number(),
  totalVolume: z.number(),
  buyVolume: z.number(),
  sellVolume: z.number(),
});

export const tradingStateSchema = z.object({
  symbol: z.string(),
  isConnected: z.boolean(),
  lastUpdate: z.number(),
  currentPrice: z.number(),
  priceChange: z.number(),
  priceChangePercent: z.number(),
});

// Types
export type Cluster = z.infer<typeof clusterSchema>;
export type CandleData = z.infer<typeof candleDataSchema>;
export type OrderBookLevel = z.infer<typeof orderBookLevelSchema>;
export type OrderBookData = z.infer<typeof orderBookDataSchema>;
export type VolumeProfileLevel = z.infer<typeof volumeProfileLevelSchema>;
export type TradingState = z.infer<typeof tradingStateSchema>;

// WebSocket message types
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("candle_update"),
    data: candleDataSchema,
  }),
  z.object({
    type: z.literal("orderbook_update"),
    data: orderBookDataSchema,
  }),
  z.object({
    type: z.literal("trade_update"),
    data: z.object({
      price: z.number(),
      volume: z.number(),
      isBuyerMaker: z.boolean(),
      timestamp: z.number(),
    }),
  }),
  z.object({
    type: z.literal("connection_status"),
    data: z.object({
      connected: z.boolean(),
      symbol: z.string(),
    }),
  }),
  z.object({
    type: z.literal("historical_data"),
    data: z.array(candleDataSchema),
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;

// User preferences (if needed later)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
