const mongoose = require("mongoose");
require("dotenv").config();

 
const DBcon = async ()=>{
    try{
        mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully");
    }catch(err){
        console.log("Error in DB connection", err);
    }
        
    }
module.exports = DBcon; 