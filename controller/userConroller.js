const reqErrorHandler = require("../middlewares/reqErrorHandler.js")
const UserModel = require('../models/user/registerSchema.js')
const addressModel = require('../models/user/addressSchema.js')
const addtToCartModel = require('../models/user/addToCartSchema.js')
const orderDetailsModel = require('../models/user/orderSummary.js')
const orderSchema = require('../models/user/OrderSchema.js')
const OTPModel = require('../models/user/otpModel.js')
const productModel = require('../models/admin/productModel.js')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const { request } = require("express");
const subCategorySchema = require('../models/admin/category.js')
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





//profile
const profile = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = await verifyToken(token); // Verify token and get userID
  try {
    const userInfo = await addressModel.find({ userID: userID, selected: true })
    // Render profile page with userID
    console.log(userInfo)
    res.render('user/Profile', { error: '', userInfo })
    // Handle result here
  } catch (error) {
    console.error('Token verification failed:', error);
  }
}


const profileMenu = async (req, res) => {
  if (req.path == '/profileMenu') {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token); // Verify token and get userID
    console.log(userID)
    const userAddress = await addressModel.find({ userID: userID })
    if (req.query.menu == 'manageAddress') {
      res.render('user/manageAddress', { userAddress })
    }
    else if (req.query.menu == 'myOrders') {
      const orderDetails = await orderSchema.find({ userID: userID })
        .populate('productID')
        .populate('addressID')
      console.log('orderdetails', orderDetails)
      res.render('user/myOrders', { orderDetails })
    }
    else if (req.query.menu == 'wishlist') {
      res.render('user/wishlist')
    }
  }
}

const saveImage = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID
}



const saveUserAddress = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID
  if (req.query.type === 'addAddress') {
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
  else if (req.query.type === 'manageAddress') {
    const addressID = req.body.addressID
    const selected = req.body.selected
    await addressModel.updateMany({}, { $set: { selected: false } })
    await addressModel.findOneAndUpdate({ _id: addressID }, { $set: { selected: selected } })
    res.redirect('/profileMenu?menu=manageAddress')
  }
  else if (req.query.type === 'deleteAddress') {
    try {
      const id = req.body.id
      await addressModel.findByIdAndDelete(id)
      res.redirect('/profileMenu?menu=manageAddress')
    } catch (error) {
      console.log(error)
    }
  }
  else if (req.query.type === 'updateAddress') {
    try {
      const id = req.query.id;
      const data = {
        fullName: req.body.fullName,
        emailAddress: req.body.emailAddress,
        phoneNo: req.body.mobileNo,
        cityDistrictTown: req.body.cityDistrictTown,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pinCode,
        gender: req.body.gender,
        address: req.body.address,
        addressType: req.body.addressType
      }

      await addressModel.findByIdAndUpdate(id, data, { new: true });
      res.redirect('/profileMenu?menu=manageAddress')
    } catch (error) {
      console.log(error)
    }
  }
}


const overviewFilter = async (req, res) => {
  // const ProductSize = req.body.ProductSize
  // const productId = req.body.productId
  productModel.findById(productId)
    .then(sizeExist => {
      // Convert sizeExist to a plain JavaScript object to avoid circular references
      const productData = sizeExist.toObject();
      // Send the converted object in the response
      res.json({ ProductData: productData });
    })
    .catch(error => {
      // Handle errors
      res.status(500).json({ error: 'Internal Server Error' });
    });


  const data = productModel.aggregate([
    {
      $group: {
        _id: `${ProductSize}`, // Group by size field
        count: { $sum: 1 } // Count occurrences of each size
      }
    },
    {
      $project: {// Exclude _id field from output
        size: "$_id", // Rename _id to size
        count: 1 // Include count field
      }
    }
  ])
}



const checkOut = async (req, res) => {

  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID
  try {
    const cartDetails = await orderDetailsModel.find({ userID: userID }).populate('productID')
    const userInfo = await addressModel.find({ userID: userID, selected: true })
    const addresses = await addressModel.find({ userID: userID })
    res.render('user/checkOut', { cartDetails, userInfo, addresses })
  } catch (error) {
    console.error("Error fetching cart products:", error);
  }

}


const orderDetails = async (req, res) => {
  const cartItems = JSON.parse(req.body.cartData);

  let data = cartItems.map((val) => {
    let details;
    if (val.userID && val.productID._id && val.quantity && val.size && val.price) {
      return details = {
        userID: val.userID,
        productID: val.productID._id,
        quantity: val.quantity,
        size: val.size,
        price: val.price
      }
    }
  }).filter(item => item); // Filter out undefined values

  for (const item of data) {
    const productExists = await orderDetailsModel.exists({
      userID: item.userID,
      productID: item.productID,
      quantity: item.quantity,
      size: item.size,
      price: item.price
    });

    if (!productExists) {
      await orderDetailsModel.create(item);
    }
  }

}

const updateCheckout = async (req, res) => {
  if (req.query.task === 'selectDeleveryAddress') {
    try {
      const addressID = req.body.addressID
      // console.log('body ',addressID,req.body.selected)
      await addressModel.updateMany({}, { $set: { selected: false } })
      await addressModel.findOneAndUpdate({ _id: addressID }, { $set: { selected: true } })
      // res.redirect('/')
    } catch (error) {
      console.log('Error on select Delivery Address')
    }
  }
  else if (req.query.task === 'updateAddress') {
    try {
      const id = req.query.id;
      const data = {
        fullName: req.body.fullName,
        emailAddress: req.body.emailAddress,
        phoneNo: req.body.mobileNo,
        cityDistrictTown: req.body.cityDistrictTown,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pinCode,
        gender: req.body.gender,
        address: req.body.address,
        addressType: req.body.addressType
      }

      await addressModel.findByIdAndUpdate(id, data, { new: true });
      res.redirect('/checkOut')
    } catch (error) {
      console.log('Error on select Delivery Address')
    }
  }
}



const checkOutTasks = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID
  if (req.query.task === 'removeProducts') {
    const orderSummaryId = req.body.id;
    console.log(orderSummaryId)
    await orderDetailsModel.deleteMany({ _id: orderSummaryId })
    res.redirect('/checkOut');
  }
  else if (req.query.task === 'saveOrderDetails') {

    const paymentMethod = req.body.paymentMethod;
    const ProductData = JSON.parse(req.body.ProductData);
    const addressID = req.body.addressID;
    //  console.log('i am here...',ProductData)

    try {
      let details;
      const orderDetails = ProductData.map((val) => {
        return details = {
          userID: val.userID,
          productID: val.productID._id,
          addressID: addressID,
          Quantity: val.quantity,
          Amount: val.price * val.quantity,
          Size: val.size,
          PaymentMethod: paymentMethod
        }
      })
      // console.log('details :', ProductData)
      await orderSchema.create(orderDetails)
      res.redirect('/profileMenu?menu=myOrders')
    } catch (error) {
      console.log(error)
    }

  }
  else if (req.query.task === 'addAddress') {

    console.log('Iam heree')
    try {
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
      res.redirect('/checkOut')
    } catch (error) {
      console.log(error)
    }
  }

}


//Section for GET Request End here.......

//..................................................................................................................................................

//Section for Post Method Starts here.....


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

// save the products to cart database
const addToCart = async (req, res) => {
  try {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token); // Verify token and get userID
    const size = req.body.size;

    const productID = req.body.productID;
    const price = req.body.price;
    const quantity = req.body.quantity;

    const data = {
      userID,
      productID,
      quantity,
      price,
      size
    }
    // console.log('Received cart data:', size);
    await addtToCartModel.create(data)
    res.json({ message: 'Success' })
  } catch (error) {
    console.log('Error While save the shoppingCart Data!')
  }
}


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
      // console.log("User data: ", checkUserPresent);
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
  addToCart,
  removeCartProduct,
  updateCheckout,
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
  saveImage,
  overviewFilter,
  checkOut,
  checkOutTasks,
  orderDetails,
  updateProfile
}