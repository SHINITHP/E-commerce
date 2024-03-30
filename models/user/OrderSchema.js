const mongoose = require('mongoose');

const orderModel = new mongoose.Schema({
    OrderDate:{
        type:Date,
        default:Date.now
    },
    userID:{
        type:mongoose.Schema.ObjectId, ref:"userRegister",
        required:true
    },
    productID:{
        type:mongoose.Schema.ObjectId,ref:"ProductDetails",
        required:true
    },
    addressID:{
        type:mongoose.Schema.ObjectId,ref:"userAddress",
        required:true
    },
    Quantity:{
        type:Number,
        required:true
    },
    Amount:{
        type:Number,
        required:true
    },
    Size:{
        type:String,
        require:true
    },
    PaymentMethod:{
        type:String,
        require:true
    },
    Status:{
        type:String,
        default:'Order Placed',
        require:true
    },

})


module.exports = mongoose.model("OrderDetails", orderModel);