const mongoose = require('mongoose');

const tradeJournalSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, uppercase: true },
    transactionType: { type: String, enum: ['BUY', 'SELL'], required: true },
    product: { type: String, enum: ['MIS', 'CNC', 'NRML', 'CO', 'BO'], default: 'MIS' },
    quantity: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, default: 0 },
    pnl: { type: Number, default: 0 },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'CLOSED' },
    strategy: { type: String, default: 'Price Action' },
    notes: { type: String, default: '' },
    tags: [{ type: String }],
    tradeDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TradeJournal', tradeJournalSchema);
