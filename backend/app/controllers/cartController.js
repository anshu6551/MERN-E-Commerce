const Cart = require('../models/Cart');
const Product = require('../models/Product');
const httpStatusCode = require('../utils/httpStatusCode');

class cartController {


    //add product to cart
    async addToCart(req, res) {
        try {
            const { productId, quantity = 1 } = req?.body;
            const adminId = req?.user?.id;

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(httpStatusCode.NOT_FOUND).json({
                    sucess: false,
                    message: "product not found",
                })
            }

            let cart = await Cart.findOne({ adminId })

            if (!cart) {
                cart = await Cart.create({
                    adminId,
                    products: [{ productId, quantity }],
                });
            } else {
                const productIndex = cart.products.findIndex(
                    (p) => p.productId.toString() === productId
                );
                if (productIndex > -1) {
                    cart.products[productIndex].quantity += quantity;
                } else {
                    cart.products.push({ productId, quantity });
                }
                
            }
            await cart.save();
            return res.status(httpStatusCode.OK).json({
                success: true,
                message: "product has been Add to Cart !",
                data: cart,
            });
        } catch (err) {
            console.log(err);
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: `${err.message || "Internal Server Error"}`
            })
        }
    }

    //get cart details
    // async getCart(req, res) {
    //     try {
    //         const adminId = req?.user?.id;

    //         const cart = await Cart.findOne({ adminId }).populate({
    //             path: "products.productId",
    //             model: Product,
    //             select: "title price images stock coinRewardEligible",
    //         });

    //         if (!cart || cart.products.length == 0) {
    //             return res.status(httpStatusCode.OK).json({
    //                 sucess: true,
    //                 message: "your cart is empty",
    //                 data: {
    //                     products: [],
    //                     tottalPrice: 0
    //                 }
    //             });
    //         }

    //         let totalPrice = 0;
    //         cart.products.forEach((item) => {
    //             if (item.productId && item.productId.price) {
    //                 const qty = Number(item.quantity) || 1;
    //                 totalPrice += item.productId.price * qty;
    //             }
    //         });

    //         return res.status(httpStatusCode.OK).json({
    //             success: true,
    //             message: "cart details get successfully",
    //             data: {
    //                 cartId: cart._id,
    //                 products: cart.products,
    //                 totalPrice: totalPrice,
    //             },
    //         });
    //     } catch (err) {
    //         return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
    //             success: false,
    //             message: `${err.message || "Internal Server Error"}`
    //         })
    //     }
    // }

    async getCart(req, res) {
    try {
        const adminId = req?.user?.id;

        if (!adminId) {
            return res.status(httpStatusCode.BAD_REQUEST).json({
                success: false,
                message: "User ID is required"
            });
        }

        const cart = await Cart.findOne({ adminId }).populate({
            path: "products.productId",
            model: Product,
            select: "title price images stock coinRewardEligible",
        });

        // 1. Check if cart doesn't exist or is completely empty
        if (!cart || !cart.products || cart.products.length === 0) {
            return res.status(httpStatusCode.OK).json({
                success: true, // Fixed typo: sucess -> success
                message: "Your cart is empty",
                data: {
                    products: [],
                    totalPrice: 0 // Fixed typo: tottalPrice -> totalPrice
                }
            });
        }

        let totalPrice = 0;
        
        // 2. Filter out items where the underlying product no longer exists (orphaned references)
        const validProducts = cart.products.filter((item) => {
            if (item.productId && typeof item.productId.price === 'number') {
                const qty = Number(item.quantity) || 1;
                totalPrice += item.productId.price * qty;
                return true;
            }
            return false; // Excludes product from the response if it was deleted from the DB
        });

        // 3. Fallback if all products in the cart were orphaned/invalid
        if (validProducts.length === 0) {
            return res.status(httpStatusCode.OK).json({
                success: true,
                message: "Your cart is empty",
                data: {
                    products: [],
                    totalPrice: 0
                }
            });
        }

        return res.status(httpStatusCode.OK).json({
            success: true,
            message: "Cart details retrieved successfully",
            data: {
                cartId: cart._id,
                products: validProducts,
                totalPrice: Number(totalPrice.toFixed(2)), // Prevents JavaScript floating-point issues (e.g., 19.99999999)
            },
        });

    } catch (err) {
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
}

    //remove product from cart

    async removeItemCart(req, res) {
        try {
            const { productId } = req.params;
            const adminId = req?.user?.id;

            const updatedCart = await Cart.findOneAndUpdate(
                { adminId },
                { $pull: { products: { productId: productId } } },
                { new: true }, //response me updated cart return karega
            ).populate({
                path: 'products.productId',
                model: Product,
                select: 'title price images stock',
            });

            if (!updatedCart || updatedCart.products.length === 0) {
                return res.status(httpStatusCode.OK).json({
                    success: true,
                    message: "product removed from cart successfully",
                    data: {
                        cartId: updatedCart ? updatedCart._id : null,
                        products: [],
                        totalPrice: 0,
                    },
                });
            }
            let totalPrice = 0;
            updatedCart.products.forEach((item) => {
                if (item.productId && item.productId.price) {
                    const qty = item.quantity || 1;
                    totalPrice += item.productId.price * qty;
                }
            });

            return res.status(httpStatusCode.OK).json({
                success: true,
                message: "product cart has been removed",
                data: {
                    cartId: updatedCart._id,
                    products: updatedCart.products,
                    totalPrice: totalPrice
                }
            });
        } catch (err) {
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: `${err.message}`,
            });
        }
    }
}
module.exports = new cartController();