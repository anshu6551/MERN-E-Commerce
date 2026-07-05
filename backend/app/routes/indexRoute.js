const express = require("express");
const router = express.Router();

const authRouter = require("./authRoute");
const productRouter = require("./productRoute")

const cartRouter = require('./cartRoute')
const reviewRouter = require("./reviewRoute");
const orderRouter = require("./orderRoute");
const walletRouter = require("./walletRoute");
const userRouter = require("./userRoute");



router.use('/auth', authRouter);
router.use('/product', productRouter);
router.use('/review', reviewRouter);
router.use('/cart', cartRouter);
router.use("/orders", orderRouter);
router.use("/wallet", walletRouter);
router.use("/userList", userRouter);

module.exports = router;