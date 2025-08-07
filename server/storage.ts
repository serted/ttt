import { type User, type InsertUser, type CandleData, type OrderBookData } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trading data storage methods
  getCandleData(symbol: string, limit?: number): Promise<CandleData[]>;
  saveCandleData(symbol: string, data: CandleData[]): Promise<void>;
  getOrderBookData(symbol: string): Promise<OrderBookData | undefined>;
  saveOrderBookData(symbol: string, data: OrderBookData): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private candleData: Map<string, CandleData[]>;
  private orderBookData: Map<string, OrderBookData>;

  constructor() {
    this.users = new Map();
    this.candleData = new Map();
    this.orderBookData = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCandleData(symbol: string, limit: number = 100): Promise<CandleData[]> {
    const data = this.candleData.get(symbol) || [];
    return data.slice(-limit);
  }

  async saveCandleData(symbol: string, data: CandleData[]): Promise<void> {
    this.candleData.set(symbol, data);
  }

  async getOrderBookData(symbol: string): Promise<OrderBookData | undefined> {
    return this.orderBookData.get(symbol);
  }

  async saveOrderBookData(symbol: string, data: OrderBookData): Promise<void> {
    this.orderBookData.set(symbol, data);
  }
}

export const storage = new MemStorage();
