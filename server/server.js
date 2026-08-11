require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./services/socketService');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const gttRoutes = require('./routes/gttRoutes');
const marketRoutes = require('./routes/marketRoutes');
const journalRoutes = require('./routes/journalRoutes');
const postbackRoutes = require('./routes/postbackRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
connectDB();

// Initialize Socket.IO Server
const io = initSocket(server);

// API Routes
app.use('/api/kite/auth', authRoutes);
app.use('/api/kite/user', userRoutes);
app.use('/api/kite/orders', orderRoutes);
app.use('/api/kite/portfolio', portfolioRoutes);
app.use('/api/kite/gtt', gttRoutes);
app.use('/api/kite/market', marketRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/kite/postback', postbackRoutes);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'OwnTrade Kite Connect v3 Backend API',
    socket: 'active',
    timestamp: new Date()
  });
});

server.listen(PORT, () => {
  console.log(`🚀 OwnTrade Backend running on port ${PORT}`);
  console.log(`⚡ Socket.IO Real-time server active`);
  console.log(`📡 Kite Connect OAuth Callback endpoint: http://localhost:${PORT}/api/kite/auth/callback`);
});
