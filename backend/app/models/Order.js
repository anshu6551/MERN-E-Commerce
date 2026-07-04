const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            priceAtPurchase: {
                type: Number,
                required: true
            }
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    walletPaymentAmount: {
        type: Number,
        required: true,
        default: 0
    },
    remainingPaymentMethod: {
        type: String,
        enum: ["COD", Online],
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["Pending", "Process", "Delivered", "Shipped", "Cancel"],
        default: "pending",
        required: true
    },
    coinEarnedFromOrder: {
        type: Number,
        default: 0
    }
},
    { timestamps: true }
);


module.exports = mongoose.model('Order', orderSchema);