const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    title: {
        type: String,
        required: [true, "product title is required"],
        trim: true
    },
     description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price not be in negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
    stock: {
      type: Number,
      required: [true, "Product stock is requierd"],
      min: [0, "Stock not be in negative"],
      default: 0,
    },
    images: {
      type: [String], // Array of image URLs (Cloudinary se aane waale)
      required: [true],
    },
    coinRewardEligible: {
      type: Boolean,
      default: true, 
    },
},{ timestamps: true}
)

module.exports = mongoose.model("Product", productSchema);