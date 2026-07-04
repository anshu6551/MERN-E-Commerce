const WalletConfig = require("../models/WalletConfig");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const httpStausCode = require("../utils/httpsStatusCode");


class walletController {
  
  // 1. GET CURRENT WALLET GLOBAL CONFIG
  // Purpose: Fetches current coin exchange rules to pre-fill the Admin UI inputs
  async getWalletConfig(req, res) {
    try {
      // Find the config document or create a default one if it doesn't exist yet
      let config = await WalletConfig.findOne();
      if (!config) {
        config = await WalletConfig.create({ 
          coinToRupeeRate: 100, 
          purchaseRewardMultiplier: 10 
        });
      }
      
      return res.status(httpStausCode.OK || 200).json({ 
        success: true, 
        data: config 
      });
    } catch (error) {
      return res.status(httpStausCode.INTERNAL_SERVER_ERROR || 500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // 2. UPDATE GLOBAL CORE RULES
  // Purpose: Triggered when Admin clicks "Apply Global Core Rules"
  async updateWalletConfig(req, res) {
    try {
      const { coinToRupeeRate, purchaseRewardMultiplier } = req.body;

      // Basic validation check
      if (coinToRupeeRate < 0 || purchaseRewardMultiplier < 0) {
        return res.status(httpStausCode.BAD_REQUEST || 400).json({
          success: false,
          message: "Values cannot be negative values."
        });
      }

      let config = await WalletConfig.findOne();
      if (config) {
        config.coinToRupeeRate = coinToRupeeRate;
        config.purchaseRewardMultiplier = purchaseRewardMultiplier;
        await config.save();
      } else {
        config = await WalletConfig.create({ coinToRupeeRate, purchaseRewardMultiplier });
      }

      return res.status(httpStausCode.OK || 200).json({
        success: true,
        message: "Global Core Rules updated successfully",
        data: config
      });
    } catch (error) {
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 3. TRIGGER SYSTEM AIR-DROP
  // Purpose: Triggered when Admin inputs a user email, quantity, and clicks "Trigger System Air-Drop"
  async triggerAirDrop(req, res) {
    try {
      const { email, coinQuantity } = req.body;

      // 1. Validation
      if (!email || !coinQuantity || Number(coinQuantity) <= 0) {
        return res.status(httpStausCode.BAD_REQUEST || 400).json({ 
          success: false, 
          message: "Please provide a valid target email and positive coin quantity." 
        });
      }

      // 2. Check if target user exists in DB
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(httpStausCode.NOT_FOUND || 404).json({ 
          success: false, 
          message: "No user account found with this email address." 
        });
      }

      // 3. Increment user's wallet balance
      user.walletBalance = (user.walletBalance || 0) + Number(coinQuantity);
      await user.save();

      // 4. Record entry to Transaction Ledger for auditing
      await Transaction.create({
        userId: user._id,
        amount: Number(coinQuantity),
        type: 'credit',
        source: 'airdrop',
        description: 'Loyalty tokens manually distributed by system administrator.'
      });

      return res.status(httpStausCode.OK || 200).json({
        success: true,
        message: `Successfully air-dropped ${coinQuantity} coins to ${email}`
      });
      
    } catch (error) {
      return res.status(httpStausCode.INTERNAL_SERVER_ERROR || 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

// Exporting an instance of the class matching your MVC pattern style
module.exports = new walletController();