const mongoose = require('mongoose');

const orderSummaryModel = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.ObjectId, ref:"userRegister",
        required:true
    },
    productID:{
        type:mongoose.Schema.ObjectId,ref:"ProductDetails",
        required:true
        // unique: true // Ensure productID is unique
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    size:{
        type:String
    }
})


module.exports = mongoose.model("orderSummary", orderSummaryModel);