const { KiteConnect } = require('kiteconnect');
const KiteSession = require('../models/KiteSession');

let activeKiteSession = {
  apiKey: process.env.KITE_API_KEY || 'demo_key',
  apiSecret: process.env.KITE_API_SECRET || 'demo_secret',
  accessToken: null,
  user: {
    user_id: 'AB1234',
    user_name: 'Demo Trader',
    email: 'trader@owntrade.com',
    user_type: 'individual'
  }
};

function getKiteInstance() {
  if (!activeKiteSession.apiKey) return null;
  const kc = new KiteConnect({
    api_key: activeKiteSession.apiKey
  });
  if (activeKiteSession.accessToken) {
    kc.setAccessToken(activeKiteSession.accessToken);
  }
  return kc;
}

// Restore session from MongoDB Atlas on server startup
async function loadSessionFromDB() {
  try {
    const latestSession = await KiteSession.findOne().sort({ updatedAt: -1 });
    if (latestSession && latestSession.accessToken) {
      activeKiteSession.apiKey = latestSession.apiKey || activeKiteSession.apiKey;
      activeKiteSession.apiSecret = latestSession.apiSecret || activeKiteSession.apiSecret;
      activeKiteSession.accessToken = latestSession.accessToken;
      activeKiteSession.user = {
        user_id: latestSession.userId,
        user_name: latestSession.userName,
        email: latestSession.userEmail,
        user_type: latestSession.userType
      };
      console.log(`✅ Restored active Zerodha session for User: ${latestSession.userName} (${latestSession.userId}) from MongoDB Atlas DB`);
    }
  } catch (err) {
    console.warn('⚠️ Session restore from DB note:', err.message);
  }
}

// Generate Login URL
function getLoginUrl(apiKey) {
  const key = apiKey || activeKiteSession.apiKey;
  return `https://kite.zerodha.com/connect/login?v=3&api_key=${key}`;
}

// Set Active Tokens
function setSessionTokens(apiKey, apiSecret, accessToken, userDetails) {
  activeKiteSession.apiKey = apiKey || activeKiteSession.apiKey;
  activeKiteSession.apiSecret = apiSecret || activeKiteSession.apiSecret;
  activeKiteSession.accessToken = accessToken;
  if (userDetails) {
    activeKiteSession.user = userDetails;
  }
}

// Mock Fallback Data Providers
const mockMargins = {
  equity: {
    enabled: true,
    net: 245800.50,
    available: { cash: 180000.00, collateral: 65800.50, intraday_payin: 0 },
    utilised: { debits: 12400.00, exposure: 5400.00, m2m_realised: 1500.00, m2m_unrealised: 2300.00 }
  },
  commodity: {
    enabled: true,
    net: 50000.00,
    available: { cash: 50000.00 },
    utilised: { debits: 0 }
  }
};

const mockOrders = [
  {
    order_id: '240811001',
    parent_order_id: null,
    exchange: 'NSE',
    tradingsymbol: 'RELIANCE',
    transaction_type: 'BUY',
    order_type: 'LIMIT',
    product: 'MIS',
    quantity: 50,
    price: 2980.50,
    trigger_price: 0,
    status: 'COMPLETE',
    status_message: null,
    order_timestamp: '2026-08-11 09:45:12'
  },
  {
    order_id: '240811002',
    parent_order_id: null,
    exchange: 'NSE',
    tradingsymbol: 'INFY',
    transaction_type: 'BUY',
    order_type: 'LIMIT',
    product: 'CNC',
    quantity: 25,
    price: 1820.00,
    trigger_price: 0,
    status: 'OPEN',
    status_message: null,
    order_timestamp: '2026-08-11 10:12:00'
  }
];

const mockHoldings = [
  {
    tradingsymbol: 'TCS',
    exchange: 'NSE',
    isin: 'INE467B01029',
    quantity: 15,
    authorised_quantity: 15,
    average_price: 3950.00,
    last_price: 4120.50,
    close_price: 4080.00,
    pnl: 2557.50,
    day_change: 40.50,
    day_change_percentage: 0.99
  },
  {
    tradingsymbol: 'HDFCBANK',
    exchange: 'NSE',
    isin: 'INE040A01034',
    quantity: 40,
    authorised_quantity: 40,
    average_price: 1620.00,
    last_price: 1685.25,
    close_price: 1670.00,
    pnl: 2610.00,
    day_change: 15.25,
    day_change_percentage: 0.91
  }
];

const mockPositions = {
  net: [
    {
      tradingsymbol: 'RELIANCE',
      exchange: 'NSE',
      product: 'MIS',
      quantity: 50,
      overnight_quantity: 0,
      multiplier: 1,
      average_price: 2980.50,
      close_price: 2970.00,
      last_price: 3012.00,
      value: -149025.00,
      pnl: 1575.00,
      m2m: 1575.00,
      unrealised: 1575.00,
      realised: 0
    }
  ],
  day: [
    {
      tradingsymbol: 'RELIANCE',
      exchange: 'NSE',
      product: 'MIS',
      quantity: 50,
      last_price: 3012.00,
      pnl: 1575.00
    }
  ]
};

const mockGTTs = [
  {
    id: 109283,
    type: 'single',
    tradingsymbol: 'NIFTY 50',
    exchange: 'NSE',
    condition: { trigger_values: [24200], last_price: 24350.50 },
    orders: [{ transaction_type: 'BUY', quantity: 50, product: 'CNC', order_type: 'LIMIT', price: 24200 }],
    status: 'active',
    created_at: '2026-08-01 11:20:00'
  }
];

module.exports = {
  activeKiteSession,
  getLoginUrl,
  setSessionTokens,
  getKiteInstance,
  loadSessionFromDB,
  mockMargins,
  mockOrders,
  mockHoldings,
  mockPositions,
  mockGTTs
};
