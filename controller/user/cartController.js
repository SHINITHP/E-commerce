const reqErrorHandler = require("../../middlewares/reqErrorHandler.js")
const UserModel = require('../../models/register.js')
const addressModel = require('../../models/address.js')
const addtToCartModel = require('../../models/cart.js')
const orderDetailsModel = require('../../models/orderSummary.js')
const orderSchema = require('../../models/order.js')
const OTPModel = require('../../models/otp.js')
const productModel = require('../../models/products.js')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const { request } = require("express");
const subCategorySchema = require('../../models/category.js')
const passport = require("passport")
require('dotenv').config()
const axios = require('axios')



//Globally declared variables

let GlobalUser = {
    userName: "",
    phoneNo: "",
    emailAddress: "",
    password: ""
  };
  
  let otp;
  
  
  // Define the verifyToken function
  function verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.id; // Return the decoded userID
    } catch (err) {
      return null; // Return null if verification fails
    }
  }
  
  //Create jwt Token 
  const MaxExpTime = 3 * 24 * 60 * 60 // expire in 3days
  const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: MaxExpTime
    })
  }
  
  

//get method for shoppingcart
const shoppingCart = async (req, res) => {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token); // Verify token and get userID
    try {
      const cartItems = await addtToCartModel.find({ userID: userID }).populate('productID');
      // console.log(cartItems)
      res.render('user/shoppingCart', { cartItems })
    } catch (error) {
      console.error("Error fetching cart products:", error);
    }
  }


  
const orderDetails = async (req, res) => {
    const cartItems = JSON.parse(req.body.cartData);
  
    try {
      for (const item of cartItems) {
        const { userID, productID, quantity, size, totalPrice } = item;
  
        if (userID && productID._id && quantity && size && totalPrice) {
          const existingItem = await orderDetailsModel.findOne({
            userID: userID,
            productID: productID._id,
            quantity: quantity,
            size: size,
            totalPrice: totalPrice
          });
  
          if (!existingItem) {
            await orderDetailsModel.create({
              userID: userID,
              productID: productID._id,
              quantity: quantity,
              size: size,
              totalPrice: totalPrice
            });
          }
        }
      }
  
      res.redirect('/checkOut');
    } catch (error) {
      console.error('Error processing cart items:', error);
      res.status(500).send('Error processing cart items');
    }
  }
  
  
const updateCart = async (req, res) => {
    try {
      const token = req.cookies.jwtUser; // Assuming token is stored in cookies
      const userID = verifyToken(token);
  
      console.log('req.body.newQty ', req.body.totalPrice)
  
      await addtToCartModel.findByIdAndUpdate(req.body.id, { $set: { quantity: req.body.newQty, totalPrice: req.body.totalPrice } })
  
    } catch (error) {
      console.log(error)
    }
  }


  
const removeCartProduct = async (req, res) => {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token); // Verify token and get userID
    try {
      if (req.query.task === 'deleteCartItem') {
        console.log('I am here to delete', req.query.id);
  
        await addtToCartModel.findOneAndDelete({ _id: req.query.id, userID: userID });
        res.redirect('/shoppingcart');
      }
    } catch (error) {
      console.log(error);
  
      res.status(500).send('Internal Server Error');
    }
  }



module.exports = { 
    shoppingCart,orderDetails,updateCart,removeCartProduct
}