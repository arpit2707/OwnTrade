const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    userName: { type: String },
    userEmail: { type: String },
    userType: { type: String, default: 'individual' },
    avatarUrl: { type: String, default: '' },
    exchanges: [{ type: String }],
    products: [{ type: String }],
    orderTypes: [{ type: String }],
    lastLoginAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
