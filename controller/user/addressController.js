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
  
  

//profile
const profile = async (req, res) => {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = await verifyToken(token); // Verify token and get userID
  
    try {
      const userInfo = await addressModel.find({ userID: userID }).populate('userID')
      const data = await UserModel.findById(userID).select('-password');
      let userData = data ? [data] : [];
      res.render('user/Profile', { error: '', userInfo, userData })
  
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }
  
  const updateProfile = async (req, res) => {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token); // Verify token and get userID
    const newData = {
      $set: {
        fullName: req.body.fullName,
        emailAddress: req.body.emailAddress,
        phoneNo: req.body.mobileNo,
        cityDistrictTown: req.body.cityDistrictTown,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pinCode
      }
    };
  
    const result = await addressModel.updateOne({ userID: userID, selected: true }, {
      $set: {
        fullName: req.body.fullName,
        emailAddress: req.body.emailAddress,
        phoneNo: req.body.mobileNo,
        cityDistrictTown: req.body.cityDistrictTown,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pinCode
      }
    });
  
    res.redirect('/Profile')
  
  }

module.exports = { 
    profile,updateProfile
}