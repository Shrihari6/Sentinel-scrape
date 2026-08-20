import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupScraperSocket } from './sockets/scraperSocket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);

// CORS configuration
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', '*'],
  credentials: true
}));

app.use(express.json());

// Socket.io initialization with CORS
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup socket event handlers
setupScraperSocket(io);

// REST Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SentinelScrape Socket.io Backend',
    collectorId: process.env.COLLECTOR_ID || 'c_mp7x8a9b2c0d1e2f',
    targetUrl: 'https://books.toscrape.com',
    timestamp: new Date().toISOString()
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ SentinelScrape Socket.io Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🎯 Default Target: https://books.toscrape.com`);
  console.log(`🆔 Collector ID: c_mp7x8a9b2c0d1e2f`);
  console.log(`====================================================`);
});

export default app;
