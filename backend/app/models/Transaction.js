const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ["credit", "debit"] // credit = coins added, debit = coins deducted
  },
  source: {
    type: String,
    required: true,
    enum: ["airdrop", "purchase_reward", "refund"] // tracks where the change came from
  },
  description: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);