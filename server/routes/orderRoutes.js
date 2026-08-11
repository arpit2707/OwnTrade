const express = require('express');
const router = express.Router();
const { getKiteInstance, activeKiteSession, mockOrders } = require('../services/kiteService');

let localOrdersStore = [...mockOrders];

// Get Orders List
router.get('/', async (req, res) => {
  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const orders = await kc.getOrders();
      return res.json({ success: true, data: orders });
    }
    res.json({ success: true, data: localOrdersStore, mode: 'simulated' });
  } catch (error) {
    res.json({ success: true, data: localOrdersStore, mode: 'simulated', warning: error.message });
  }
});

// Place Order (Regular, AMO, Iceberg)
router.post('/place', async (req, res) => {
  const {
    exchange = 'NSE',
    tradingsymbol,
    transaction_type,
    quantity,
    product = 'MIS',
    order_type = 'LIMIT',
    price = 0,
    trigger_price = 0,
    variety = 'regular',
    disclosed_quantity = 0,
    iceberg_legs = 0,
    iceberg_quantity = 0
  } = req.body;

  if (!tradingsymbol || !transaction_type || !quantity) {
    return res.status(400).json({ success: false, message: 'tradingsymbol, transaction_type, and quantity are required' });
  }

  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const orderParams = {
        exchange,
        tradingsymbol,
        transaction_type,
        quantity: Number(quantity),
        product,
        order_type,
        price: Number(price),
        trigger_price: Number(trigger_price)
      };

      if (disclosed_quantity) orderParams.disclosed_quantity = Number(disclosed_quantity);
      if (iceberg_legs) orderParams.iceberg_legs = Number(iceberg_legs);
      if (iceberg_quantity) orderParams.iceberg_quantity = Number(iceberg_quantity);

      const result = await kc.placeOrder(variety, orderParams);
      return res.json({ success: true, order_id: result.order_id, message: 'Order placed successfully' });
    }

    // Simulated Placement
    const newOrderId = '240811' + Math.floor(100 + Math.random() * 900);
    const newOrder = {
      order_id: newOrderId,
      parent_order_id: null,
      exchange,
      tradingsymbol: tradingsymbol.toUpperCase(),
      transaction_type,
      order_type,
      product,
      quantity: Number(quantity),
      price: Number(price) || (order_type === 'MARKET' ? 1500.00 : 0),
      trigger_price: Number(trigger_price),
      status: 'COMPLETE',
      status_message: null,
      order_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    localOrdersStore.unshift(newOrder);
    res.json({
      success: true,
      order_id: newOrderId,
      message: `[Simulated] Order placed for ${quantity} shares of ${tradingsymbol}`,
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Modify Order
router.put('/modify/:order_id', async (req, res) => {
  const { order_id } = req.params;
  const { quantity, price, trigger_price, order_type = 'LIMIT', variety = 'regular' } = req.body;

  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const result = await kc.modifyOrder(variety, order_id, {
        quantity: quantity ? Number(quantity) : undefined,
        price: price ? Number(price) : undefined,
        trigger_price: trigger_price ? Number(trigger_price) : undefined,
        order_type
      });
      return res.json({ success: true, order_id: result.order_id, message: 'Order modified successfully' });
    }

    // Simulated Modify
    const orderIndex = localOrdersStore.findIndex(o => o.order_id === order_id);
    if (orderIndex !== -1) {
      if (quantity) localOrdersStore[orderIndex].quantity = Number(quantity);
      if (price) localOrdersStore[orderIndex].price = Number(price);
      if (trigger_price) localOrdersStore[orderIndex].trigger_price = Number(trigger_price);
      localOrdersStore[orderIndex].status = 'OPEN';
    }

    res.json({ success: true, order_id, message: `Order ${order_id} modified successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel Order
router.delete('/cancel/:order_id', async (req, res) => {
  const { order_id } = req.params;
  const { variety = 'regular' } = req.query;

  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const result = await kc.cancelOrder(variety, order_id);
      return res.json({ success: true, order_id: result.order_id, message: 'Order cancelled successfully' });
    }

    // Simulated Cancel
    localOrdersStore = localOrdersStore.filter(o => o.order_id !== order_id);
    res.json({ success: true, order_id, message: `Order ${order_id} cancelled successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Trades Executed
router.get('/trades', async (req, res) => {
  try {
    const kc = getKiteInstance();
    if (kc && activeKiteSession.accessToken && !activeKiteSession.accessToken.includes('demo')) {
      const trades = await kc.getTrades();
      return res.json({ success: true, data: trades });
    }
    const executed = localOrdersStore.filter(o => o.status === 'COMPLETE');
    res.json({ success: true, data: executed, mode: 'simulated' });
  } catch (error) {
    res.json({ success: true, data: [], mode: 'simulated', warning: error.message });
  }
});

module.exports = router;
