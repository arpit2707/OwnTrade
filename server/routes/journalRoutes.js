const express = require('express');
const router = express.Router();
const TradeJournal = require('../models/TradeJournal');

// Fallback in-memory store if DB isn't connected yet
let memoryJournal = [
  {
    _id: 'j1',
    symbol: 'RELIANCE',
    transactionType: 'BUY',
    product: 'MIS',
    quantity: 50,
    entryPrice: 2980.50,
    exitPrice: 3012.00,
    pnl: 1575.00,
    status: 'CLOSED',
    strategy: 'Breakout Strategy',
    notes: 'Good 15-min candle breakout above 2980 resistance.',
    tags: ['Breakout', 'Intraday'],
    createdAt: new Date()
  },
  {
    _id: 'j2',
    symbol: 'INFY',
    transactionType: 'BUY',
    product: 'CNC',
    quantity: 25,
    entryPrice: 1820.00,
    exitPrice: 1805.00,
    pnl: -375.00,
    status: 'CLOSED',
    strategy: 'VWAP Bounce',
    notes: 'Stopped out near support.',
    tags: ['VWAP', 'Swing'],
    createdAt: new Date()
  }
];

// Get All Trade Logs & Analytics Summary
router.get('/', async (req, res) => {
  try {
    let trades = [];
    try {
      trades = await TradeJournal.find().sort({ createdAt: -1 });
    } catch (err) {
      trades = memoryJournal;
    }
    if (!trades.length) trades = memoryJournal;

    // Calculate Analytics
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    const winRate = totalTrades > 0 ? ((winningTrades.length / totalTrades) * 100).toFixed(1) : 0;
    const totalPnl = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const grossProfit = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? 'INF' : '0.00';

    res.json({
      success: true,
      summary: {
        totalTrades,
        winRate: Number(winRate),
        totalPnl: Number(totalPnl.toFixed(2)),
        grossProfit: Number(grossProfit.toFixed(2)),
        grossLoss: Number(grossLoss.toFixed(2)),
        profitFactor
      },
      data: trades
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Trade Journal Entry
router.post('/', async (req, res) => {
  const { symbol, transactionType, product, quantity, entryPrice, exitPrice, pnl, strategy, notes, tags } = req.body;

  if (!symbol || !transactionType || !quantity || !entryPrice) {
    return res.status(400).json({ success: false, message: 'symbol, transactionType, quantity, and entryPrice are required' });
  }

  const calculatedPnl = pnl !== undefined ? Number(pnl) : (exitPrice ? (transactionType === 'BUY' ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity) : 0);

  try {
    let newEntry;
    try {
      newEntry = await TradeJournal.create({
        symbol: symbol.toUpperCase(),
        transactionType,
        product,
        quantity: Number(quantity),
        entryPrice: Number(entryPrice),
        exitPrice: Number(exitPrice || 0),
        pnl: calculatedPnl,
        strategy,
        notes,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
      });
    } catch (dbErr) {
      newEntry = {
        _id: 'j_' + Date.now(),
        symbol: symbol.toUpperCase(),
        transactionType,
        product,
        quantity: Number(quantity),
        entryPrice: Number(entryPrice),
        exitPrice: Number(exitPrice || 0),
        pnl: calculatedPnl,
        strategy: strategy || 'General',
        notes: notes || '',
        tags: Array.isArray(tags) ? tags : [],
        createdAt: new Date()
      };
      memoryJournal.unshift(newEntry);
    }

    res.json({ success: true, message: 'Trade log added to journal', data: newEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Trade Entry
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    try {
      await TradeJournal.findByIdAndDelete(id);
    } catch (dbErr) {
      memoryJournal = memoryJournal.filter(j => j._id !== id);
    }
    res.json({ success: true, message: 'Journal entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
