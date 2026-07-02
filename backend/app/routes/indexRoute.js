const express = require ("express");
const router = express.Router();

const authRouter = require("./authRoute");


router.use('/auth',authRouter);

module.exports = router;