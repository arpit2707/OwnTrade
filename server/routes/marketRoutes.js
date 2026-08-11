const express = require('express');
const router = express.Router();
const { getKiteInstance, activeKiteSession } = require('../services/kiteService');
const { livePrices } = require('../services/socketService');

// Get Quote / LTP for instruments (e.g. NSE:RELIANCE, NSE:NIFTY 50)
router.get('/quote', async (req, res) => {
  const instruments = req.query.i ? (Array.isArray(req.query.i) ? req.query.i : [req.query.i]) : ['NSE:RELIANCE', 'NSE:INFY', 'NSE:NIFTY 50'];

  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const quote = await kc.getQuote(instruments);
      return res.json({ success: true, data: quote });
    }

    // Dynamic Live Prices from Socket Service
    const mockQuotes = {};
    instruments.forEach(inst => {
      const sym = inst.split(':')[1] || inst;
      const liveTick = livePrices[sym] || { ltp: 3012.00, open: 3000, high: 3035, low: 2985, close: 2996.50, volume: 1250000, change: 15.50, pChange: 0.52 };

      mockQuotes[inst] = {
        instrument_token: 738561,
        timestamp: new Date().toISOString(),
        last_price: liveTick.ltp,
        net_change: liveTick.change,
        ohlc: {
          open: liveTick.open,
          high: liveTick.high,
          low: liveTick.low,
          close: liveTick.close
        },
        volume: liveTick.volume
      };
    });

    res.json({ success: true, data: mockQuotes, mode: 'simulated' });
  } catch (error) {
    res.json({ success: true, data: {}, mode: 'simulated', warning: error.message });
  }
});

// Get Historical Candle Data (Intraday & Daily)
router.get('/historical/:instrument_token/:interval', async (req, res) => {
  const { instrument_token, interval } = req.params;

  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const candles = await kc.getHistoricalData(instrument_token, interval, '2026-08-01', '2026-08-11');
      return res.json({ success: true, data: candles });
    }

    // Generate Realistic Mock OHLC Candles
    const mockCandles = [];
    let startPrice = 2950;
    const now = new Date();

    for (let i = 25; i >= 0; i--) {
      const candleTime = new Date(now.getTime() - i * 15 * 60000).toISOString().substring(0, 16);
      const change = (Math.random() - 0.48) * 18;
      const open = startPrice;
      const close = parseFloat((open + change).toFixed(2));
      const high = parseFloat((Math.max(open, close) + Math.random() * 8).toFixed(2));
      const low = parseFloat((Math.min(open, close) - Math.random() * 8).toFixed(2));
      const volume = Math.floor(5000 + Math.random() * 25000);

      mockCandles.push([candleTime, open, high, low, close, volume]);
      startPrice = close;
    }

    res.json({ success: true, data: mockCandles, mode: 'simulated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
