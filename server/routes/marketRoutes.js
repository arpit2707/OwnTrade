const express = require('express');
const router = express.Router();
const { getKiteInstance, activeKiteSession } = require('../services/kiteService');

// Get Quote / LTP for instruments (e.g. NSE:RELIANCE, NSE:NIFTY 50)
router.get('/quote', async (req, res) => {
  const instruments = req.query.i ? (Array.isArray(req.query.i) ? req.query.i : [req.query.i]) : ['NSE:RELIANCE', 'NSE:INFY', 'NSE:NIFTY 50'];

  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const quote = await kc.getQuote(instruments);
      return res.json({ success: true, data: quote });
    }

    // Mock Quote Data
    const mockQuotes = {};
    instruments.forEach(inst => {
      const sym = inst.split(':')[1] || inst;
      let basePrice = 2500;
      if (sym === 'NIFTY 50') basePrice = 24350.50;
      if (sym === 'INFY') basePrice = 1820.00;
      if (sym === 'TCS') basePrice = 4120.50;
      if (sym === 'RELIANCE') basePrice = 3012.00;

      mockQuotes[inst] = {
        instrument_token: 738561,
        timestamp: new Date().toISOString(),
        last_price: basePrice,
        net_change: 15.50,
        ohlc: {
          open: basePrice - 20,
          high: basePrice + 35,
          low: basePrice - 25,
          close: basePrice - 10
        },
        volume: 1245080
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
  const { from = '2026-08-01', to = '2026-08-11' } = req.query;

  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const candles = await kc.getHistoricalData(instrument_token, interval, from, to);
      return res.json({ success: true, data: candles });
    }

    // Generate Realistic Mock OHLC Candles for Interactive Recharts
    const mockCandles = [];
    let startPrice = 2950;
    const now = new Date();

    for (let i = 20; i >= 0; i--) {
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
