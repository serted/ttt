import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { WSMessage, candleDataSchema, orderBookDataSchema } from "@shared/schema";
import axios from "axios";

// Store active connections
const connections = new Set<WebSocket>();
let candleData: any[] = [];
let orderBookData: any = { bids: [], asks: [], lastUpdate: Date.now() };

// Binance API configuration
const BINANCE_WS_BASE = "wss://stream.binance.com:9443/ws";
const BINANCE_API_BASE = "https://api.binance.com/api/v3";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for trading data
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Function to calculate clusters from trade data
  function calculateClusters(candle: any, trades: any[]): any[] {
    const { high, low } = candle;
    const priceRange = high - low;
    if (priceRange === 0) return [];

    const numClusters = 20;
    const clusterSize = priceRange / numClusters;
    const clusters: any[] = [];

    for (let i = 0; i < numClusters; i++) {
      const priceLevel = low + (i * clusterSize);
      const relevantTrades = trades.filter(trade => 
        trade.price >= priceLevel && trade.price < priceLevel + clusterSize
      );

      const buyVolume = relevantTrades
        .filter(trade => !trade.isBuyerMaker)
        .reduce((sum, trade) => sum + parseFloat(trade.quantity), 0);
      
      const sellVolume = relevantTrades
        .filter(trade => trade.isBuyerMaker)
        .reduce((sum, trade) => sum + parseFloat(trade.quantity), 0);

      const totalVolume = buyVolume + sellVolume;
      const delta = buyVolume - sellVolume;
      const aggression = totalVolume > 0 ? Math.abs(delta) / totalVolume : 0;

      if (totalVolume > 0) {
        clusters.push({
          price: priceLevel,
          volume: totalVolume,
          buyVolume,
          sellVolume,
          delta,
          aggression,
        });
      }
    }

    return clusters.sort((a, b) => b.volume - a.volume);
  }

  // Function to fetch historical data
  async function fetchHistoricalData(symbol: string = "BTCUSDT"): Promise<any[]> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/klines`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval: "1m",
          limit: 100,
        },
      });

      const klines = response.data;
      const processedData = klines.map((kline: any[]) => {
        const [timestamp, open, high, low, close, volume] = kline;
        
        // Generate realistic cluster data based on OHLC
        const clusters = [];
        const priceRange = parseFloat(high) - parseFloat(low);
        const numClusters = Math.min(15, Math.max(5, Math.floor(priceRange / (parseFloat(close) * 0.0001))));
        
        for (let i = 0; i < numClusters; i++) {
          const price = parseFloat(low) + (priceRange * i / numClusters);
          const baseVolume = parseFloat(volume) / numClusters;
          const volumeVariation = Math.random() * 0.5 + 0.5; // 0.5 to 1.0 multiplier
          const totalVolume = baseVolume * volumeVariation;
          
          // Simulate buy/sell distribution
          const buyRatio = Math.random() * 0.4 + 0.3; // 30% to 70% buy volume
          const buyVolume = totalVolume * buyRatio;
          const sellVolume = totalVolume * (1 - buyRatio);
          
          clusters.push({
            price,
            volume: totalVolume,
            buyVolume,
            sellVolume,
            delta: buyVolume - sellVolume,
            aggression: Math.abs(buyVolume - sellVolume) / totalVolume,
          });
        }

        return {
          time: Math.floor(timestamp / 1000),
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
          volume: parseFloat(volume),
          buyVolume: parseFloat(volume) * (Math.random() * 0.3 + 0.4), // 40-70% buy volume
          sellVolume: parseFloat(volume) * (Math.random() * 0.3 + 0.3), // 30-60% sell volume
          delta: 0, // Will be calculated from buy/sell volumes
          clusters: clusters.sort((a, b) => b.volume - a.volume),
        };
      });

      // Calculate delta for each candle
      processedData.forEach(candle => {
        candle.delta = candle.buyVolume - candle.sellVolume;
      });

      return processedData;
    } catch (error) {
      console.error("Error fetching historical data:", error);
      return [];
    }
  }

  // Function to fetch order book data
  async function fetchOrderBook(symbol: string = "BTCUSDT"): Promise<any> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/depth`, {
        params: {
          symbol: symbol.toUpperCase(),
          limit: 20,
        },
      });

      const { bids, asks } = response.data;
      
      return {
        bids: bids.map(([price, volume]: [string, string]) => ({
          price: parseFloat(price),
          volume: parseFloat(volume),
        })),
        asks: asks.map(([price, volume]: [string, string]) => ({
          price: parseFloat(price),
          volume: parseFloat(volume),
        })),
        lastUpdate: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching order book:", error);
      return { bids: [], asks: [], lastUpdate: Date.now() };
    }
  }

  // WebSocket connection handler
  wss.on('connection', async (ws: WebSocket) => {
    console.log('Client connected to trading WebSocket');
    connections.add(ws);

    // Send connection status
    ws.send(JSON.stringify({
      type: "connection_status",
      data: { connected: true, symbol: "BTCUSDT" }
    }));

    try {
      // Send historical data
      const historical = await fetchHistoricalData();
      candleData = historical;
      
      ws.send(JSON.stringify({
        type: "historical_data",
        data: historical
      }));

      // Send initial order book
      const initialOrderBook = await fetchOrderBook();
      orderBookData = initialOrderBook;
      
      ws.send(JSON.stringify({
        type: "orderbook_update",
        data: initialOrderBook
      }));

    } catch (error) {
      console.error("Error sending initial data:", error);
    }

    ws.on('close', () => {
      console.log('Client disconnected from trading WebSocket');
      connections.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connections.delete(ws);
    });
  });

  // Simulate real-time updates
  const updateInterval = setInterval(async () => {
    if (connections.size === 0) return;

    try {
      // Update order book
      const newOrderBook = await fetchOrderBook();
      orderBookData = newOrderBook;

      // Broadcast order book update
      const orderBookMessage = JSON.stringify({
        type: "orderbook_update",
        data: newOrderBook
      });

      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(orderBookMessage);
        }
      });

      // Simulate candle updates (every 10 seconds)
      if (Math.random() < 0.1 && candleData.length > 0) {
        const lastCandle = candleData[candleData.length - 1];
        const priceChange = (Math.random() - 0.5) * lastCandle.close * 0.001; // Max 0.1% change
        const newClose = lastCandle.close + priceChange;
        
        const updatedCandle = {
          ...lastCandle,
          close: newClose,
          high: Math.max(lastCandle.high, newClose),
          low: Math.min(lastCandle.low, newClose),
          time: Math.floor(Date.now() / 1000),
        };

        // Update the last candle
        candleData[candleData.length - 1] = updatedCandle;

        const candleMessage = JSON.stringify({
          type: "candle_update",
          data: updatedCandle
        });

        connections.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(candleMessage);
          }
        });
      }

    } catch (error) {
      console.error("Error in update interval:", error);
    }
  }, 2000); // Update every 2 seconds

  // Cleanup on server shutdown
  process.on('SIGTERM', () => {
    clearInterval(updateInterval);
    wss.close();
  });

  return httpServer;
}
