const Product = require("../models/Product");
const httpStatusCode = require("../utils/httpStatusCode");
const cloudinary = require('cloudinary').v2;



class ProductController {
    
    async createProduct(req, res) {
  try {
    // 1. Cloudinary config apply karein
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    let requestData = {};

    // 2. Bulletproof Parsing: Check karein data wrapper string hai ya direct fields hain
    if (req.body.data && typeof req.body.data === "string") {
      requestData = JSON.parse(req.body.data);
    } else {
      // Agar direct payload aa raha ho (Jaise aapke frontend screenshot mein hai)
      requestData = req.body;
    }

    // 3. Variables destructure karein safely
    const { title, description, price, category, stock, coinRewardEligible } = requestData;

    // --- Baki ka aapka upload aur creation logic bilkul same rahega ---
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "product_images",
        });
        imageUrls.push(result.secure_url);
      }
    } else if (requestData.images && Array.isArray(requestData.images)) {
      imageUrls = requestData.images;
    }

    const newProduct = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      images: imageUrls,
      coinRewardEligible,
    });

    return res.status(httpStatusCode.CREATED).json({
      success: true,
      message: "Product has been created",
      data: newProduct,
    });

  } catch (err) {
    console.error("Actual Backend Error Structure:", err); // Yeh line real issue debug karne mein help karegi
    return res.status(httpStatusCode.BAD_REQUEST).json({
      success: false,
      message: err.message,
    });
  }
}
    async getProduct(req, res) {
        try {
            const products = await Product.find();
            return res.status(httpStatusCode.OK).json({
                success: true,
                message: "All products fetched successfully",
                length: products.length,
                data: products
            })
        }
        catch (err) {
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: `${err?.message || "Internal Server Error"}`
            })
        }

    }

    //edit product

    async updateProduct(req, res) {
        try {
            const { id } = req.params;

            const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            })
            if (!updateProduct) {
                return res.status(httpStatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Product not found"
                })
            }
            return res.status(httpStatusCode.OK).json({
                success: true,
                message: "product updated successfully",
                data: updateProduct
            })
        }

        catch (err) {
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: `${err?.message || "Internal Server Error"}`
            })
        }
    }



    async deleteProduct(req, res) {
        try {
            const { id } = req?.params;
            const productDelete = await Product.findByIdAndDelete(id);
            if (!productDelete) {
                return res.status(httpStatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Product not found"
                })
            }

            return res.status(httpStatusCode.OK).json({
                success: true,
                message: "Product deleted successfully"
            })
        }
        catch (err) {
            return res.status(httpStatusCode.NOT_FOUND).json({
                success: false,
                message: `${err?.message || "Internal Server Error"}`
            })
        }
    }
}

module.exports = new ProductController();