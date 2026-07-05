const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const AdminAuthcheck = require('../middleware/AdminAuthCheck');
const Authcheck = require('../middleware/AuthCheck');

// Secure Admin Management Gateways
router.get("/admin/users", Authcheck, AdminAuthcheck, userController.getAllUsersForAdmin);
router.put("/admin/users/status/:id", Authcheck, AdminAuthcheck, userController.toggleUserStatus);

module.exports = router;