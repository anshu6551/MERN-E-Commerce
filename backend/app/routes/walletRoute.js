const express = require('express');
const walletController = require('../controllers/walletController');
const AdminAuthcheck = require('../middlewares/AdminAuthCheck');
const Authcheck = require('../middlewares/AuthCheck');
const router = express.Router();

// 1. GET Current Rules
router.get('/get-config', Authcheck, AdminAuthcheck, walletController.getWalletConfig);

// 2. PUT Update Rules
router.put('/update-config', Authcheck, AdminAuthcheck, walletController.updateWalletConfig);

// 3. POST Trigger System Air-Drop
router.post('/trigger-airdrop', Authcheck, AdminAuthcheck, walletController.triggerAirDrop);

module.exports = router;