const mongoose = require('mongoose');

const kiteSessionSchema = new mongoose.Schema(
  {
    apiKey: { type: String, required: true },
    apiSecret: { type: String },
    accessToken: { type: String },
    publicToken: { type: String },
    userId: { type: String },
    userName: { type: String },
    userEmail: { type: String },
    userType: { type: String },
    loginTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('KiteSession', kiteSessionSchema);
