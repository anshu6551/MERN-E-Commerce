const mongoose = require('mongoose');

const walletConfigSchema = new mongoose.Schema({
  coinToRupeeRate: {
    type: Number,
    required: true,
    default: 100 // Default to 100 Loyalty Coins = ₹1
  },
  purchaseRewardMultiplier: {
    type: Number,
    required: true,
    default: 10 // Default to 10 Reward Coins per ₹100 spent
  }
}, { timestamps: true });

module.exports = mongoose.model('WalletConfig', walletConfigSchema);