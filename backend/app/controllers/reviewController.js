const Review = require("../models/Review")
const Product = require("../models/Product")
const httpStatusCode = require("../utils/httpStatusCode")


class ReviewController {

    async addReview(req, res) {
        try {
            const { productId, rating, comment } = req.body;
            const adminId = req?.user?._id || req?.user?.id || req?.admin?._id || req?.admin?.id;

            // Safeguard: Stop the request immediately if no user is found in the token
            if (!adminId) {
                return res.status(httpStatusCode.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized: User session not found. Please log in again."
                });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(httpStatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Product not found!",
                });
            }

            // Is Existing review
            let alreadyReviewed = await Review.findOne({ productId, adminId });

            if (alreadyReviewed) {
                alreadyReviewed.rating = rating;
                alreadyReviewed.comment = comment;
                await alreadyReviewed.save();

                return res.status(httpStatusCode.OK).json({
                    success: true,
                    message: "Review Updated",
                    data: alreadyReviewed,
                });
            }

            // New review
            const newReview = await Review.create({
                productId,
                adminId,
                rating,
                comment,
            });

            return res.status(httpStatusCode.OK).json({
                success: true,
                message: "Review successfully added!",
                data: newReview,
            });
        } catch (err) {
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
        }
    }

    // 2. GET ALL REVIEWS FOR A PRODUCT
    async getProductReviews(req, res) {
        try {
            const { productId } = req.params;

            const reviews = await Review.find({ productId }).populate({
                path: "adminId",
                select: "name email",
            });

            return res.status(httpStatusCode.OK).json({
                success: true,
                count: reviews.length,
                data: reviews,
            });
        } catch (err) {
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
        }
    }

    // get All Reviews for Admin Panel

    async getAllReviewsForAdmin(req, res) {
        try {
            const reviews = await Review.find()
                .populate({
                    path: "productId",
                    select: "title",
                })
                .populate({
                    path: "adminId",
                    select: "name email",
                })
                .sort({ createdAt: -1 });

            return res.status(httpStatusCode.OK).json({
                success: true,
                count: reviews.length,
                reviews: reviews,
            });
        } catch (err) {
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
        }
    }



}



module.exports = new ReviewController()