const mongoose = require('mongoose');

const orderSummaryModel = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.ObjectId, ref:"userRegister",
        required:true
    },
    productID:{
        type:mongoose.Schema.ObjectId,ref:"ProductDetails",
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    size:{
        type:String
    }
})


module.exports = mongoose.model("orderSummary", orderSummaryModel);