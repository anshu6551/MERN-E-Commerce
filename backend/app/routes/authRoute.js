const express = require("express");
const router = express.Router();
// const AuthController = require ("../controllers/authController");
const authController = require("../controllers/authController");


router.post('/register', authController.userRegister)
router.get('/verify-email',authController.verifyEmail)
router.post('/login',authController.userLogin)

module.exports = router;
