const express = require("express");

const router = express.Router();
const reviewController = require('../controllers/reviewController');
const AdminAuthCheck = require('../middleware/AdminAuthCheck');
const AuthCheck = require('../middleware/AuthCheck');


router.post("/add-review", AuthCheck, reviewController.addReview);
router.get("/product-reviews/:productId", reviewController.getProductReviews);
router.get("/admin/product-reviews", AuthCheck , AdminAuthCheck, reviewController.getAllReviewsForAdmin);





module.exports = router ;