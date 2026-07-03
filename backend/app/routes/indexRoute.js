const express = require ("express");
const router = express.Router();

const authRouter = require("./authRoute");
const productRouter = require("./productRoute")
const reviewRouter = require("./reviewRoute")


router.use('/auth',authRouter);
router.use('/product',productRouter);
router.use('/review',reviewRouter);

module.exports = router;