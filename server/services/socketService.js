const { Server } = require('socket.io');

let ioInstance = null;
let liveTickInterval = null;

// Mock Watchlist Prices
const livePrices = {
  RELIANCE: { ltp: 3012.00, open: 2990.00, high: 3025.00, low: 2985.00, close: 2996.50, volume: 1250000, change: 15.50, pChange: 0.52 },
  INFY: { ltp: 1820.00, open: 1835.00, high: 1840.00, low: 1812.00, close: 1832.40, volume: 840000, change: -12.40, pChange: -0.68 },
  TCS: { ltp: 4120.50, open: 4080.00, high: 4135.00, low: 4075.00, close: 4080.00, volume: 620000, change: 40.50, pChange: 0.99 },
  'NIFTY 50': { ltp: 24350.50, open: 24220.00, high: 24380.00, low: 24200.00, close: 24224.70, volume: 5400000, change: 125.80, pChange: 0.52 },
  'BANKNIFTY': { ltp: 52400.00, open: 52100.00, high: 52550.00, low: 52050.00, close: 52150.00, volume: 3200000, change: 250.00, pChange: 0.48 }
};

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  ioInstance.on('connection', (socket) => {
    console.log(`⚡ Client connected via Socket.IO: ${socket.id}`);

    // Send initial market state immediately
    socket.emit('market_ticks', livePrices);

    // Start background tick generator if not already active
    startLiveTickStream();

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      // Stop timer if 0 connected clients to save 512MB RAM resources
      if (ioInstance.engine.clientsCount === 0 && liveTickInterval) {
        clearInterval(liveTickInterval);
        liveTickInterval = null;
        console.log('💤 Suspended live ticks generator (0 active clients)');
      }
    });
  });

  return ioInstance;
}

// Low-memory lightweight tick simulator
function startLiveTickStream() {
  if (liveTickInterval) return;

  liveTickInterval = setInterval(() => {
    if (!ioInstance || ioInstance.engine.clientsCount === 0) return;

    Object.keys(livePrices).forEach(sym => {
      const item = livePrices[sym];
      const delta = (Math.random() - 0.49) * (item.ltp * 0.0015);
      const newLtp = parseFloat((item.ltp + delta).toFixed(2));
      const tickDirection = newLtp >= item.ltp ? 'UP' : 'DOWN';

      item.ltp = newLtp;
      item.high = Math.max(item.high, newLtp);
      item.low = Math.min(item.low, newLtp);
      item.change = parseFloat((item.ltp - item.close).toFixed(2));
      item.pChange = parseFloat(((item.change / item.close) * 100).toFixed(2));
      item.tickDirection = tickDirection;
      item.timestamp = new Date().toISOString();
    });

    // Broadcast live ticks to all connected clients
    ioInstance.emit('market_ticks', livePrices);
  }, 1000); // 1-second live stream updates
}

// Broadcast order execution event
function broadcastOrderEvent(eventData) {
  if (ioInstance) {
    ioInstance.emit('order_update', eventData);
  }
}

module.exports = {
  initSocket,
  broadcastOrderEvent,
  livePrices
};
