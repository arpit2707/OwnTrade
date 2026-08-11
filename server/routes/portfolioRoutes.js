const express = require('express');
const router = express.Router();
const { getKiteInstance, activeKiteSession, mockHoldings, mockPositions } = require('../services/kiteService');

let localHoldingsStore = [...mockHoldings];
let localPositionsStore = JSON.parse(JSON.stringify(mockPositions));

// Get Holdings
router.get('/holdings', async (req, res) => {
  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const holdings = await kc.getHoldings();
      return res.json({ success: true, data: holdings });
    }
    res.json({ success: true, data: localHoldingsStore, mode: 'simulated' });
  } catch (error) {
    res.json({ success: true, data: localHoldingsStore, mode: 'simulated', warning: error.message });
  }
});

// Get Positions (Day & Net)
router.get('/positions', async (req, res) => {
  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const positions = await kc.getPositions();
      return res.json({ success: true, data: positions });
    }
    res.json({ success: true, data: localPositionsStore, mode: 'simulated' });
  } catch (error) {
    res.json({ success: true, data: localPositionsStore, mode: 'simulated', warning: error.message });
  }
});

// Convert Position Product (MIS -> CNC, etc.)
router.post('/convert', async (req, res) => {
  const {
    exchange = 'NSE',
    tradingsymbol,
    transaction_type,
    position_type = 'day',
    quantity,
    old_product,
    new_product
  } = req.body;

  if (!tradingsymbol || !quantity || !old_product || !new_product) {
    return res.status(400).json({ success: false, message: 'tradingsymbol, quantity, old_product, and new_product are required' });
  }

  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const result = await kc.convertPosition({
        exchange,
        tradingsymbol,
        transaction_type,
        position_type,
        quantity: Number(quantity),
        old_product,
        new_product
      });
      return res.json({ success: true, result, message: 'Position converted successfully' });
    }

    // Simulated Position Conversion
    const targetNet = localPositionsStore.net.find(p => p.tradingsymbol === tradingsymbol);
    if (targetNet) {
      targetNet.product = new_product;
    }

    res.json({
      success: true,
      message: `Position for ${tradingsymbol} converted from ${old_product} to ${new_product}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
