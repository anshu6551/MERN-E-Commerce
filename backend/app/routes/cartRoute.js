const express = require("express");

const router = express.Router();
const CartController = require('../controllers/cartController');
const Authcheck = require('../middleware/AuthCheck');


router.post('/add-cart',Authcheck,CartController.addToCart);
router.get('/get-cart',Authcheck,CartController.getCart);
router.delete('/remove-item/:productId',Authcheck, CartController.removeItemCart);

module.exports = router;