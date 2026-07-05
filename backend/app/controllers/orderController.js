const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const WalletConfig = require('../models/WalletConfig');
const Transaction = require('../models/Transaction');
const httpStatusCode = require('../utils/httpStatusCode');



class orderController {


    // 1.create new order(checkout from cart)
    async createOrder(req, res) {
        try {
            const adminId = req?.user?.id;
            const { remainingPaymentMethod } = req.body;

            const cart = await Cart.findOne({ adminId });
            if (!cart || cart.products.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Your Cart is empty ! Please add some Items to Cart!',
                })
            }
            let totalAmount = 0;
            const orderItems = [];

            //2.loop chla kr hr ek product ki quantity aur price fetch karega
            for (const item of cart.products) {
                const product = await Product.findById(item.productId);

                if (!product) {
                    return res.status(httpStatusCode.NOT_FOUND).json({
                        success: false,
                        message: `Product record not found in Database!`,
                    })
                }
                // cart me actual quantity ko strictly read kr aha
                const itemQuantity = Number(item.quantity) || 1;
                const productStock = Number(product.stock) || 0;

                // inventory check verification 
                if (productStock < itemQuantity) {
                    return res.status(400).json({
                        success: false,
                        message: `${product.title} stock is only ${productStock} items available.`
                    })
                }

                // pricing aur calculations sync
                const priceAtPurchase = Number(product.price) || 0

                //fix : total amount ko price * itemQuantity ke sath add karenge (4999 * 5 = 24995)
                totalAmount += priceAtPurchase * itemQuantity;

                // Order items array mein push karenge taaki response/DB mein quantity sahi dikhe
                orderItems.push({
                    productId: item.productId,
                    quantity: itemQuantity,
                    priceAtPurchase
                });

                // Stock update safely
                product.stock = productStock - itemQuantity;
                await product.save();
            }
            // Dynamic Wallet Configuration Rules fetch karenge
            let config = await WalletConfig.findOne();
            if (!config) {
                config = await WalletConfig.create({ coinToRupeeRate: 100, purchaseRewardMultiplier: 10 });
            }

            // Calculation Formula: (totalAmount / 100) * multiplier
            const calculatedCoins = Math.floor((totalAmount / 100) * config.purchaseRewardMultiplier);

            //3.New Order Create karenge
            const newOrder = await Order.create({
                adminId: adminId,
                items: orderItems,
                totalAmount,
                walletPaymentAmount: 0,
                remainingPaymentMethod: remainingPaymentMethod || "COD",
                orderStatus: "Delivered", // Aapka preset default
                coinsEarnedFromOrder: calculatedCoins
            });

            // 4. Cart khali kar denge
            cart.products = [];
            await cart.save();

            // Since orderStatus is initialized directly as "Delivered", we credit coins immediately
            if (newOrder.orderStatus === "Delivered" && calculatedCoins > 0) {
                const user = await User.findById(adminId);
                if (user) {
                    user.walletBalance = (user.walletBalance || 0) + calculatedCoins;
                    await user.save();

                    await Transaction.create({
                        userId: adminId,
                        amount: calculatedCoins,
                        type: 'credit',
                        source: 'purchase_reward',
                        description: `Earned rewards for order reference ID: ${newOrder._id}`
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: "Order successfully placed 🛒",
                data: newOrder,
            });

        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // 📦 2. GET USER ORDERS (CUSTOMER HISTORY)
  async getUserOrders(req, res) {
    try {
      const adminId = req?.admin?.id;
      const orders = await Order.find({ userId: adminId })
        .populate("items.productId", "title images")
        .sort({ createdAt: -1 });

      return res.status(httpStatusCode.OK || 200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 📈 3. GET ALL ORDERS FOR ADMIN PANEL
  async getAllOrdersForAdmin(req, res) {
    try {
      const orders = await Order.find()
        .populate("adminId", "name email")
        .populate("items.productId", "title price")
        .sort({ createdAt: -1 });

      return res.status(httpStatusCode.OK || 200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 🔄 4. UPDATE ORDER STATUS (ADMIN ACTION DROPDOWN)
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params; 
      const { status } = req.body;    

      console.log(" Order ID:", orderId, "Naya Status:", status);

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status value sending will mandatory!",
        });
      }

      // Fetch before check to avoid duplicate reward distributions
      const orderCheck = await Order.findById(orderId);
      if (!orderCheck) {
        return res.status(404).json({
          success: false,
          message: "Order not Found in DataBase!",
        });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus: status }, 
        { new: true } 
      );

      // If status changes to Delivered, and it wasn't already marked delivered
      if (status === "Delivered" && orderCheck.orderStatus !== "Delivered") {
        console.log(`Order ${orderId} delivered. User gets ${updatedOrder.coinsEarnedFromOrder} coins reward!`);
        
        if (updatedOrder.coinsEarnedFromOrder > 0) {
          const user = await User.findById(updatedOrder.userId);
          if (user) {
            user.walletBalance = (user.walletBalance || 0) + updatedOrder.coinsEarnedFromOrder;
            await user.save();

            await Transaction.create({
              userId: user._id,
              amount: updatedOrder.coinsEarnedFromOrder,
              type: 'credit',
              source: 'purchase_reward',
              description: `Earned rewards for order reference ID: ${updatedOrder._id}`
            });
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: `Order status successfully Changed '${status}'!`,
        data: updatedOrder,
      });

    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new orderController();
