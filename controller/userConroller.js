const reqErrorHandler = require("../middlewares/reqErrorHandler.js")
const UserModel = require('../models/user/registerSchema.js')
const addressModel = require('../models/user/addressSchema.js')
const OTPModel = require('../models/user/otpModel.js')
const productModel = require('../models/admin/productModel.js')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const { request } = require("express");
const subCategorySchema = require('../models/admin/category.js')
const passport = require("passport")
require('dotenv').config()
const fetch = require('node-fetch'); 
const axios = require('axios')



//Globally declared variables

let GlobalUser = {
  userName: "",
  phoneNo: "",
  emailAddress: "",
  password: ""
};

let otp;


//Create jwt Token 
const MaxExpTime = 3 * 24 * 60 * 60 // expire in 3days
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: MaxExpTime
  })
}



//..................................................................................................................................................

//Section for GET Request start here.......

//show landing page 
const landingPage = async (req, res) => {
  const subCategories = await subCategorySchema.find({})
  // console.log(subCategories);
  if (req.path == '/') {

    const ProductData = await productModel.find({})
    res.render('user/index', { ProductData, userId: '' })
  }
  else if (req.path == '/allProducts') {
    const page = req.query.page;
    const perPage = 4;
    let docCount;
    const ProductData = await productModel.find({})
      .countDocuments()
      .then(documents => {
        docCount = documents;

        return productModel.find({})
          .skip((page - 1) * perPage)
          .limit(perPage)
      })
      .then(ProductData => {
        res.render('user/allProducts', {
          route: 'allProducts',
          ProductData,
          category: '',
          subCategories,
          currentPage: page,
          totalDocuments: docCount,
          pages: Math.ceil(docCount / perPage)
        })
      })
  }
  else if (req.path == '/filterCategory') {
    const category = req.query.cat
    const page = req.query.page;
    const perPage = 4;
    let docCount;
    const ProductData = await productModel.find({ CategoryName: category })
      .countDocuments()
      .then(documents => {
        docCount = documents;
        return productModel.find({ CategoryName: category })
          .skip((page - 1) * perPage)
          .limit(perPage)
      })
      .then(ProductData => {
        res.render('user/allProducts', {
          route: 'filterCategory',
          ProductData,
          category,
          subCategories,
          currentPage: page,
          totalDocuments: docCount,
          pages: Math.ceil(docCount / perPage)
        })
      })
  }
}

//Show register page
const registerPage = (req, res) => {
  res.render('user/register')
}

//show enterOTP for registration
const enterOtp = (req, res) => {
  res.render('user/enterOtp')
}

// show login page
const loginPage = (req, res) => {
  res.render('user/login', { error: "" })
}

const google = (req, res) => {

}



// show the page to enter the email to send otp when the user forgot password.
const sendEmailOtp = (req, res) => {
  res.render('user/sendEmailOtp', { message: '' })
}

// show forgotEnterOtp page to enter otp
const forgotEnterOtp = (req, res) => {
  res.render('user/forgotEnterOtp', { message: '' })
}


//Show reset password page
const resetPassword = (req, res) => {
  res.render('user/resetPassword')
}


//get method for shoppingcart
const shoppingCart = (req, res) => {
  res.render('user/shoppingCart')
}

//logout get Request
const logout = async (req, res) => {
  res.clearCookie('jwtUser');  // Clear the cookie
  res.redirect('/')
}

const filterProducts = async (req, res) => {
  if (req.query.subCategory) {
    const subCategories = await subCategorySchema.find({})
    const ProductData = await productModel.find({ subCategory: req.query.subCategory, CategoryName: req.query.category })
    res.render('user/allProducts', { ProductData, category: req.query.category, subCategories })
  }
}
process.env.JWT_SECRET

// Define the verifyToken function
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id; // Return the decoded userID
  } catch (err) {
    return null; // Return null if verification fails
  }
}


//profile
const profile = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = await verifyToken(token); // Verify token and get userID
  try {
    const userInfo = await addressModel.aggregate([
      {
        $lookup: {
          from: "userregisters",
          localField: 'userID',
          foreignField: '_id',
          as: 'UserAddress'
        }
      },
      {
        $project: {
          "UserAddress.password": 0 // Exclude the password field
        }
      }
    ]);
    if (!userID) {
      res.render('user/login', { error: " " }); // Render login page if token is invalid
    } else {
      // Render profile page with userID
          res.render('user/Profile', { error: '', userInfo })
    }
    // Handle result here
  } catch (error) {
    console.error('Token verification failed:', error);
  }
}


const profileMenu = async (req, res) => {
  if (req.path == '/profileMenu') {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token); // Verify token and get userID
    const userAddress = await addressModel.find({ userID: userID })
    if (req.query.menu == 'manageAddress') {
      res.render('user/manageAddress', { userAddress })
    }
    else if (req.query.menu == 'myOrders') {
      res.render('user/myOrders')
    }
    else if (req.query.menu == 'wishlist') {
      res.render('user/wishlist')
    }
  }
}

const saveImage = async(req,res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID

}

const saveIndexData = async(req,res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID
  axios.post()
  
}


const saveUserAddress = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID
  const {
    addressType, address, pincode,
    state, gender, emailAddress,
    country, cityDistrictTown, phoneNo,
    fullName
  } = req.body

  const UserAddress = {
    addressType, address, pincode,
    state, gender, emailAddress,
    country, cityDistrictTown, phoneNo,
    fullName, userID
  }

  await addressModel.create(UserAddress);
  res.redirect('/profileMenu?menu=manageAddress')
}


//Section for GET Request End here.......

//..................................................................................................................................................

//Section for Post Method Starts here.....


//send OTP for the registration of user 
const sentOTP = async (req, res) => {
  try {
    //requesting the data from the body and assigning that data to a global variable.
    GlobalUser.userName = req.body.userName
    GlobalUser.phoneNo = req.body.phoneNo
    GlobalUser.emailAddress = req.body.emailAddress
    GlobalUser.password = req.body.password

    const emailAddress = GlobalUser.emailAddress
    // Check if user is already present
    const checkUserPresent = await UserModel.findOne({ emailAddress });
    // If user found with provided email
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: 'User is already registered',
      });
    }
    //generate OTP 
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    //just check the otp is correct 
    let result = await OTPModel.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTPModel.findOne({ otp: otp });
    }
    //save the otp to the database
    const otpPayload = { emailAddress, otp };
    await OTPModel.create(otpPayload);
    res.render('user/enterOtp')//render the enterotp page
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
//..................................................................................................................................................

//Post method for resend Otp 
const resendOtp = async (req, res) => {
  try {
    const emailAddress = GlobalUser.emailAddress
    //generate OTP 
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    let result = await OTPModel.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTPModel.findOne({ otp: otp });
    }
    const otpPayload = { emailAddress, otp };
    const otpBody = await OTPModel.create(otpPayload);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
//..................................................................................................................................................

//save the user data to mongodb when the user enter the correct otp.
const createUser = async (req, res) => {
  try {
    const emailAddress = GlobalUser.emailAddress
    const password = GlobalUser.password


    const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body
    const combinedOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
    // Find the most recent OTP for the email
    const response = await OTPModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);
    // console.log( response[0].otp, 'dshsdsdmn :', otp, combinedOTP)

    if (combinedOTP !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      })
    } else {
      console.log('i am here !!! ')
      // Secure password
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(password, 10);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: `Hashing password error for ${password}: ` + error.message,
        });
      }
      // hash the password
      GlobalUser.password = hashedPassword
      //store the user data to mongodb

      const Token = createToken(GlobalUser.emailAddress)
      res.cookie('jwtUser', Token, { httpOnly: true, maxAge: MaxExpTime * 1000 });

      await UserModel.create(GlobalUser);
      res.redirect('/')
    }

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
//..................................................................................................................................................

//post method for login page
const userLogin = (async (req, res) => {
  try {
    const { emailAddress, password } = req.body
    const userExist = await UserModel.findOne({ emailAddress: emailAddress });
    console.log('userEmailfromDB : ', userExist);
    //check the user is exist or not
    if (userExist) {
      const isPasswordMatch = await bcrypt.compare(password, userExist.password)
      if (isPasswordMatch) {
        if (userExist.status === true) {
          // const userData = await UserModel.create(GlobalUser);
          const Token = createToken(userExist._id)
          console.log(Token)
          res.cookie('jwtUser', Token, { httpOnly: true, maxAge: MaxExpTime * 1000 });
          // res.redirect(`/?id=${userExist._id}`)
          res.redirect('/')
          // res.render('user/index',{userId: userExist._id})
        }
        else {
          res.render('user/login', { error: "User Blocked!" })
        }
      } else {
        res.render('user/login', { error: "Wrong Password!" })
      }
    } else {
      res.render('user/login', { error: "Entered  Email Address is wrong!" })
    }
  } catch (error) {
    console.log(error);
    res.render('user/login', { error: "Error while login" })
  }
})
//..................................................................................................................................................

//post method for sendEmailOtp page for forgotPassword
const postsendEmailOtp = async (req, res) => {
  try {
    GlobalUser.emailAddress = req.body.emailAddress
    const emailAddress = GlobalUser.emailAddress
    // console.log('00100012092838!! : ',emailAddress);
    const checkUserPresent = await UserModel.findOne({ emailAddress });
    console.log(checkUserPresent);
    if (checkUserPresent) {
      console.log("User data: ", checkUserPresent);
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      let result = await OTPModel.findOne({ otp: otp });
      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
        });
        result = await OTPModel.findOne({ otp: otp });
      }
      const otpPayload = { emailAddress, otp };
      await OTPModel.create(otpPayload);
      res.redirect('/forgotEnterOtp')
    } else {
      res.render('user/sendEmailOtp', { message: 'User not found !' })
    }

  } catch (error) {
    console.log('connection Error : ', error);
  }
}
//..................................................................................................................................................

// post method for forgotEnterOtp page for forgotpassword
const postForgotEnterOtp = async (req, res) => {
  try {
    const emailAddress = GlobalUser.emailAddress
    const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body
    const combinedOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;

    const response = await OTPModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);
    console.log('response   = ', response);
    console.log(otp);
    console.log(response[0].otp);
    if (response.length === 0 || combinedOTP !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      });
    } else {
      res.redirect('/resetPassword')
    }
  } catch (error) {
    console.log(error)
  }
}
//..................................................................................................................................................

//to save the updated user password
const createPassword = async (req, res) => {
  try {
    const emailAddress = GlobalUser.emailAddress
    const password = req.body.password
    // console.log('!!!!!!!!!!!!!!!!! : ',password);
    // Find the most recent OTP for the email
    const response = await OTPModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      });
    }
    const user = await UserModel.findOne({ emailAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // // Secure password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Hashing password error for ${password}: ` + error.message,
      });
    }
    // hash the password
    user.password = hashedPassword
    await user.save();
    res.render('user/login', { error: 'Reset Password Successful' })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
//..................................................................................................................................................

//get method for product overview
const productOverview = async (req, res) => {
  try {
    const id = req.query.id
    const ProductData = await productModel.find({ _id: id })
    const productColor = await productModel.find({ ProductName: ProductData[0].ProductName })
    const firstProduct = ProductData[0];
    const CategoryName = firstProduct.CategoryName;
    const relatedItem = await productModel.find({ CategoryName: CategoryName })
    res.render('user/productOverview', { ProductData, relatedItem, productColor })
  } catch (error) {
    console.log(error)
  }
}

//Section for Post Method End here.....

//.................................................................................................................................................


//export all the above functions
module.exports = {
  registerPage,
  landingPage,
  loginPage,
  userLogin,
  logout,
  profile,
  profileMenu,
  google,
  shoppingCart,
  sendEmailOtp,
  postsendEmailOtp,
  forgotEnterOtp,
  postForgotEnterOtp,
  resetPassword,
  createPassword,
  saveUserAddress,
  filterProducts,
  enterOtp,
  sentOTP,
  createUser,
  resendOtp,
  productOverview,
  saveImage
}