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






//show landing page 
const landingPage = async (req, res) => {
    const subCategories = await subCategorySchema.find({})
    // console.log(subCategories);
    if (req.path == '/') {
  
      const ProductData = await productModel.find({})
      res.render('user/index', { ProductData, userId: '' })
    }
    else if (req.path == '/allProducts') {
  
      if(req.query.task =='search'){
  
        console.log('i am hereee bro ',req.query.text)
        let data =req.query.text;
  
        const searchText = new RegExp("^"+data,"i")
        console.log(searchText)
  
        const page = req.query.page;
        const perPage = 4;
        let docCount;
        const ProductData = await productModel.find({ProductName:{$regex:searchText}})
          .countDocuments()
          .then(documents => {
            docCount = documents;
    
            return productModel.find({ProductName:{$regex:searchText}})
              .skip((page - 1) * perPage)
              .limit(perPage)
          })
          .then(ProductData => {
            console.log('ProductData',ProductData)
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
      
      else if(req.query.task=='showAllPro'){
  
        console.log('else statement')
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
  
  
//get method for product overview
const productOverview = async (req, res) => {
    try {
      const token = req.cookies.jwtUser; // Assuming token is stored in cookies
      const userID = verifyToken(token); // Verify token and get userID
  
      const id = req.query.id
      const ProductData = await productModel.find({ _id: id })
      const cart = await addtToCartModel.find({ userID: userID, productID: id })
  
      console.log('cart ', cart)
  
      const productColor = await productModel.find({ ProductName: ProductData[0].ProductName })
      const firstProduct = ProductData[0];
      const CategoryName = firstProduct.CategoryName;
      const relatedItem = await productModel.find({ CategoryName: CategoryName })
      res.render('user/productOverview', { ProductData, relatedItem, productColor, cart })
    } catch (error) {
      console.log(error)
    }
  }

  //post method for overview
const overviewFilter = async (req, res) => {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token); // Verify token and get userID
  
    if (req.query.task === 'addToCart') {
      try {
        const productID = req.body.productID;
        const productData = await productModel.findById(productID)
        const price = req.body.Price;
        const size = req.body.size != undefined ? req.body.size : productData.ProductSize[0].size;
        let quantity = req.body.quantity ;
  
        console.log(productData, price, userID, size, req.body.proDiscount)
  
        const data = {
          userID,
          productID,
          quantity,
          totalPrice: price * quantity - req.body.proDiscount * quantity,
          size
        }
        // console.log('Received cart data:', size);
        await addtToCartModel.create(data)
        res.json({ message: 'Success' })
      } catch (error) {
        console.log('Error While save the shoppingCart Data!', error)
      }
    }
  
    // const data = productModel.aggregate([
    //   {
    //     $group: {
    //       _id: `${ProductSize}`, // Group by size field
    //       count: { $sum: 1 } // Count occurrences of each size
    //     }
    //   },
    //   {
    //     $project: {// Exclude _id field from output
    //       size: "$_id", // Rename _id to size
    //       count: 1 // Include count field
    //     }
    //   }
    // ])
  }

  
const filterProducts = async (req, res) => {
    const subCategories = await subCategorySchema.find({})
    if (req.query.subCategory ) {
      let subCategory = req.query.subCategory
      let category = req.query.category
      // console.log('else statement')
      const page = req.query.page;
      const perPage = 4;
      let docCount;
      const ProductData = await productModel.find({CategoryName:category,subCategory:subCategory})
        .countDocuments()
        .then(documents => {
          docCount = documents;
  
          return productModel.find({CategoryName:category,subCategory:subCategory})
            .skip((page - 1) * perPage)
            .limit(perPage)
        })
        .then(ProductData => {
          console.log('else statement',ProductData)
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
  






module.exports = { 
    landingPage,productOverview,overviewFilter,filterProducts,profileMenu
}