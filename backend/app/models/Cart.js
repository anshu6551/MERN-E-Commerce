const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
     },
     products:[{ 
        productId:{ 
            type:mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required:true
        },
        quantity:{
        type:Number,
        default:1,
        required:true,
        min:[1,'Min one product is required']
      }
     }], 
     
});
module.exports = mongoose.model('Cart',cartSchema);