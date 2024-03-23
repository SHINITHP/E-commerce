const mongoose = require('mongoose');

const shoppingCartModel = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.ObjectId,
        required:true
    },
    productID:{
        type:mongoose.Schema.ObjectId,
        required:true
    }
})


module.exports = mongoose.model("shoppingCart", shoppingCartModel);