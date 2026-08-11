const express = require('express');
const router = express.Router();
const { getKiteInstance, activeKiteSession, mockGTTs } = require('../services/kiteService');

let localGTTStore = [...mockGTTs];

// Get All GTT Orders
router.get('/', async (req, res) => {
  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const gtts = await kc.getGTTs();
      return res.json({ success: true, data: gtts });
    }
    res.json({ success: true, data: localGTTStore, mode: 'simulated' });
  } catch (error) {
    res.json({ success: true, data: localGTTStore, mode: 'simulated', warning: error.message });
  }
});

// Create GTT Order (Single or OCO)
router.post('/place', async (req, res) => {
  const {
    type = 'single', // 'single' or 'two-leg' (OCO)
    tradingsymbol,
    exchange = 'NSE',
    trigger_values = [],
    last_price = 0,
    orders = []
  } = req.body;

  if (!tradingsymbol || !trigger_values.length || !orders.length) {
    return res.status(400).json({ success: false, message: 'tradingsymbol, trigger_values, and orders are required' });
  }

  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const result = await kc.placeGTT({
        type,
        condition: {
          exchange,
          tradingsymbol,
          trigger_values,
          last_price: Number(last_price)
        },
        orders
      });
      return res.json({ success: true, trigger_id: result.trigger_id, message: 'GTT order placed successfully' });
    }

    // Simulated GTT Creation
    const newGttId = Math.floor(100000 + Math.random() * 900000);
    const newGtt = {
      id: newGttId,
      type,
      tradingsymbol: tradingsymbol.toUpperCase(),
      exchange,
      condition: {
        trigger_values: trigger_values.map(Number),
        last_price: Number(last_price) || 1500
      },
      orders,
      status: 'active',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    localGTTStore.unshift(newGtt);
    res.json({
      success: true,
      trigger_id: newGttId,
      message: `[Simulated] GTT ${type.toUpperCase()} order set for ${tradingsymbol}`,
      data: newGtt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete GTT Order
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const result = await kc.deleteGTT(id);
      return res.json({ success: true, trigger_id: result.trigger_id, message: 'GTT order deleted successfully' });
    }

    // Simulated Delete
    localGTTStore = localGTTStore.filter(g => String(g.id) !== String(id));
    res.json({ success: true, trigger_id: id, message: `GTT trigger ${id} deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
