const express = require ("express");
const router = express.Router();

const authRouter = require("./authRoute");
const productRouter = require("./productRoute")
const reviewRouter = require("./reviewRoute")
const cartRouter = require('./cartRoute')


router.use('/auth',authRouter);
router.use('/product',productRouter);
router.use('/review',reviewRouter);
router.use('/cart',cartRouter);

module.exports = router;