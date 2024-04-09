const reqErrorHandler = require("../middlewares/reqErrorHandler.js")
const UserModel = require('../models/register.js')
const addressModel = require('../models/address.js')
const addtToCartModel = require('../models/cart.js')
const orderDetailsModel = require('../models/orderSummary.js')
const orderSchema = require('../models/order.js')
const OTPModel = require('../models/otp.js')
const productModel = require('../models/products.js')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const { request } = require("express");
const subCategorySchema = require('../models/category.js')
const passport = require("passport")
require('dotenv').config()
const axios = require('axios')




module.exports = { 
    
}