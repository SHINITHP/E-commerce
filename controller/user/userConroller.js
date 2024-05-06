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
const couponModel = require('../../models/coupon.js')
const appliedCoupon = require('../../models/AppliedCoupon.js')
const passport = require("passport")
require('dotenv').config()
const axios = require('axios')
const Razorpay = require('razorpay')
const crypto = require('crypto');
const walletSchema = require('../../models/wallet.js')
const wishlistSchema = require('../../models/wishlist.js')

// Function to generate a simple unique ID
function generateSimpleUniqueId() {
  const uniqueId = crypto.randomBytes(16).toString('base64'); // Generate a random unique ID
  return uniqueId;
}

// Example usage
const uniqueId = generateSimpleUniqueId();
// console.log("Unique ID:", uniqueId);

//Globally declared variables

let GlobalUser = {
  userName: "",
  phoneNo: "",
  emailAddress: "",
  password: ""
};

let couponApplied = false;

let otp;


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAYKEY,
  key_secret: process.env.RAZORPAY_SECRET
});

const onlinPayment = async (req, res) => {
  let amount = req.body.amount;

  console.log('amount', amount)

  const paymentData = {
    amount: amount * 100, // Amount in paise (100 paise = 1 INR)
    currency: 'INR',
    receipt: uniqueId,
  };

  try {
    const response = await razorpay.orders.create(paymentData);
    res.json(response);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
}

const verifyPayment = async (req, res) => {
  const payment = req.body.payment
  const order = req.body.order
  // console.log(payment.razorpay_payment_id,'req.body.payment')
  let hmac = crypto.createHash('sha256', process.env.RAZORPAYKEY)
  hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
  hmac = hmac.digest('hex')

  if (hmac == payment.razorpay_signature) {
    res.status(200).send('Payment verified successfully.');
  }
}


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
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token);

  const wishlist = await wishlistSchema.find({ userID: userID })

  const productID = wishlist.map((val) => val.productID)
  console.log(productID, ': productID')

  let allProducts = await productModel.find({})

  let BrandNames = allProducts.map((val) => val.BrandName)

  let uniqueBrandNames = [...new Set(BrandNames)];

  if (req.path == '/') {

    const ProductData = await productModel.find({})
    res.render('user/index', { ProductData, userId: '', productID })
  }
  else if (req.path == '/allProducts') {

    if (req.query.task == 'search') {
      if (req.query.cat) {
        let cat = req.query.cat;
        console.log('i am hereee bro ', req.query.text, cat)
        let data = req.query.text;



        const searchText = new RegExp("^" + data, "i")
        console.log(searchText)

        const page = req.query.page;
        const perPage = 4;
        let docCount;
        const ProductData = await productModel.find({
          ProductName: { $regex: searchText },
          CategoryName: { $in: cat }
        })
          .countDocuments()
          .then(documents => {
            docCount = documents;

            return productModel.find({
              ProductName: { $regex: searchText },
              CategoryName: { $in: cat }
            })
              .skip((page - 1) * perPage)
              .limit(perPage)
          })
          .then(ProductData => {
            console.log('ProductData', ProductData)
            res.render('user/allProducts', {
              route: 'allProducts',
              ProductData,
              category: cat,
              subCategories,
              uniqueBrandNames,
              currentPage: page,
              totalDocuments: docCount,
              pages: Math.ceil(docCount / perPage)
            })
          })

      } else {
        console.log('i am hereee bro ', req.query.text)
        let data = req.query.text;

        const searchText = new RegExp("^" + data, "i")
        console.log(searchText)

        const page = req.query.page;
        const perPage = 4;
        let docCount;
        const ProductData = await productModel.find({ ProductName: { $regex: searchText } })
          .countDocuments()
          .then(documents => {
            docCount = documents;

            return productModel.find({ ProductName: { $regex: searchText } })
              .skip((page - 1) * perPage)
              .limit(perPage)
          })
          .then(ProductData => {
            console.log('ProductData', ProductData)
            res.render('user/allProducts', {
              route: 'allProducts',
              ProductData,
              category: '',
              subCategories,
              uniqueBrandNames,
              currentPage: page,
              totalDocuments: docCount,
              pages: Math.ceil(docCount / perPage)
            })
          })

      }

    }

    else if (req.query.task == 'showAllPro') {

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
            uniqueBrandNames,
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
          uniqueBrandNames,
          currentPage: page,
          totalDocuments: docCount,
          pages: Math.ceil(docCount / perPage)
        })
      })
  }
}
const priceFilter = async (req, res) => {

  let allProducts = await productModel.find({})
  let BrandNames = allProducts.map((val) => val.BrandName)
  let uniqueBrandNames = [...new Set(BrandNames)];


  if (req.query.task === 'priceFilter') {
    try {

      const subCategories = await subCategorySchema.find({})
      console.log('req.body.minimum : ', req.body.minimum)
      const page = req.query.page;
      const perPage = 4;
      let docCount;
      const minimum = req.body.minimum;
      const maximum = req.body.maximum;
      const BrandName = req.body.brandName;

      console.log('BrandName : ', BrandName)

      if (req.query.cat !== 'allProducts') {
        const ProductData = await productModel.find({
          SalesRate: { $gte: minimum, $lte: maximum },
          CategoryName: req.query.cat,
          BrandName: BrandName
        })
          .countDocuments()
          .then(documents => {
            docCount = documents;

            return productModel.find({
              SalesRate: { $gte: minimum, $lte: maximum },
              CategoryName: req.query.cat,
              BrandName: BrandName
            })
              .skip((page - 1) * perPage)
              .limit(perPage)
          })
          .then(ProductData => {
            res.render('user/allProducts', {
              route: 'allProducts',
              ProductData,
              category: '',
              subCategories,
              uniqueBrandNames,
              currentPage: page,
              totalDocuments: docCount,
              pages: Math.ceil(docCount / perPage)
            })
          })
      } else {
        const ProductData = await productModel.find({
          $or: [
            { SalesRate: { $gte: minimum, $lte: maximum } },
            { BrandName: BrandName }
          ]
        })
          .countDocuments()
          .then(documents => {
            docCount = documents;

            return productModel.find({
              $or: [
                { SalesRate: { $gte: minimum, $lte: maximum } },
                { BrandName: BrandName }
              ]
            })
              .skip((page - 1) * perPage)
              .limit(perPage)
          })
          .then(ProductData => {
            res.render('user/allProducts', {
              route: 'allProducts',
              ProductData,
              category: '',
              subCategories,
              uniqueBrandNames,
              currentPage: page,
              totalDocuments: docCount,
              pages: Math.ceil(docCount / perPage)
            })
          })
      }


    } catch (error) {
      console.log(error)
    }
  }
}
//Show register page
const registerPage = (req, res) => {
  res.render('user/register')
}

//show enterOTP for registration
const enterOtp = (req, res) => {
  res.render('user/enterOtp', { message: '', timer: '2:00' })
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

  let allProducts = await productModel.find({})

  let BrandNames = allProducts.map((val) => val.BrandName)

  let uniqueBrandNames = [...new Set(BrandNames)];

  const subCategories = await subCategorySchema.find({})
  if (req.query.subCategory) {
    let subCategory = req.query.subCategory
    let category = req.query.category
    // console.log('else statement')
    const page = req.query.page;
    const perPage = 4;
    let docCount;
    const ProductData = await productModel.find({ CategoryName: category, subCategory: subCategory })
      .countDocuments()
      .then(documents => {
        docCount = documents;

        return productModel.find({ CategoryName: category, subCategory: subCategory })
          .skip((page - 1) * perPage)
          .limit(perPage)
      })
      .then(ProductData => {
        console.log('else statement', ProductData)
        res.render('user/allProducts', {
          route: 'allProducts',
          ProductData,
          category: '',
          subCategories,
          uniqueBrandNames,
          currentPage: page,
          totalDocuments: docCount,
          pages: Math.ceil(docCount / perPage)
        })
      })
  }

}





//profile
const profile = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = await verifyToken(token); // Verify token and get userID

  try {
    const userInfo = await addressModel.find({ userID: userID }).populate('userID')
    const data = await UserModel.findById(userID).select('-password');
    let userData = data ? [data] : [];
    console.log(userData, ' : userData')
    res.render('user/Profile', { error: '', userInfo, userData })

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
      const wishlist = await wishlistSchema.find({ userID: userID }).populate('productID')
      res.render('user/wishlist', { wishlist })
    }
    else if (req.query.menu == 'Wallet') {

      const page = req.query.page;
      const perPage = 4;
      let docCount;

      const lastdetails = await walletSchema.findOne({ userID: userID }).sort({ added: -1 });
      const walletDetails = await walletSchema.find({ userID: userID })
        .populate('userID')
        .populate('productID')
        .populate('orderID')
        .countDocuments()
        .then(documents => {
          docCount = documents;
          return walletSchema.find({ userID: userID })
            .populate('userID')
            .populate('productID')
            .populate('orderID')
            .skip((page - 1) * perPage)
            .limit(perPage)
        })
        .then(walletDetails => {
          if (walletDetails.length > 0) { 
            res.render('user/wallet', {
              route: 'wallet',
              walletDetails,
              currentPage: page,
              totalDocuments: docCount,
              pages: Math.ceil(docCount / perPage),
              balance: lastdetails.balance
            })
          }else{
            res.render('user/wallet', {
              route: 'wallet',
              walletDetails,
              currentPage: page,
              totalDocuments: docCount,
              pages: Math.ceil(docCount / perPage),
              balance: ''
            })
          }
        })
        
      // if (walletDetails.length > 0) {
      //   const lastdetails = await walletSchema.findOne({ userID: userID }).sort({ added: -1 });
      //   console.log(walletDetails)
      //   res.render('user/wallet', { walletDetails, balance: lastdetails.balance })
      // }
      // else {
      //   res.render('user/wallet', { walletDetails, balance: '' })
      // }

    } else if (req.query.menu === 'coupon') {
      res.render('user/coupon')
    }
  }
}

const DeleteData = async (req, res) => {
  const { productID } = req.query;
  if (req.query.menu == 'removeWishlist') {
    try {
      console.log('profileMenu112332', productID)
      await wishlistSchema.findByIdAndDelete(productID)
      res.redirect('profileMenu?menu=wishlist')
    } catch (error) {
      console.log(error)
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
      res.redirect('/profileMenu?menu=manageAddress')
    } catch (error) {
      console.log(error)
    }

  } else if (req.query.task === 'addToCart') {
    // console.log('wishlist:', req.body.productID, userID)
    try {
      console.log('iam in the add to cart')
      const productID = req.body.productID
      const data = await productModel.findById(productID);
      const cartExist = await addtToCartModel.find({ productID: productID })
      if (cartExist) {
        res.json({ message: 'success' })
      } else {
        const details = {
          userID,
          productID,
          quantity: 1,
          totalPrice: data.SalesRate,
          size: data.ProductSize[0].size,
          totalMRP: data.MRP
        }
        console.log('Received cart data:', details);
        await addtToCartModel.create(details)
        res.json({ message: 'success' })
      }
    } catch (error) {
      console.log(error)
    }
  }
  else if (req.query.type === 'manageAddress') {
    try {
      const addressID = req.body.addressID
      const selected = req.body.selected
      await addressModel.updateMany({}, { $set: { selected: false } })
      await addressModel.findOneAndUpdate({ _id: addressID }, { $set: { selected: selected } })
      res.redirect('/profileMenu?menu=manageAddress')
    } catch (error) {
      console.log(error)
    }
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
  else if (req.query.type === 'cancelRequest') {

    const orderID = req.body.orderID
    const reqReason = req.body.reqReason
    const optionalReason = req.body.data
    console.log('i am herree ', orderID, optionalReason, reqReason)

    // { $set: { quantity: req.body.newQty
    const value = await orderSchema.findByIdAndUpdate(
      orderID,
      { $set: { requestReason: reqReason, request: true, comment: optionalReason, reqDate: Date.now() } }
    );
    console.log(value)

  } else if (req.query.type === 'returnOrder') {
    console.log(req.body.orderID)

    let optionalComment = req.body.optionalreason === '' ? 'empty' : req.body.optionalreason
    console.log(optionalComment)
    try {
      await orderSchema.findByIdAndUpdate(req.body.orderID,
        {
          $set: { return: true, requestReason: req.body.reason, comment: optionalComment }
        })
    } catch (error) {

    }
  }
}


const overviewFilter = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID

  if (req.query.task === 'addToCart') {
    try {
      const productID = req.body.productID;
      const productData = await productModel.findById(productID)
      const price = req.body.Price;
      const size = req.body.size != undefined ? req.body.size : productData.ProductSize[0].size;
      let quantity = req.body.quantity;

      console.log(price, price * quantity - req.body.proDiscount * quantity, productData)

      console.log('productData', productData)

      const data = {
        userID,
        productID,
        quantity,
        totalPrice: price * quantity - req.body.proDiscount * quantity,
        size,
        totalMRP: productData.MRP * quantity
      }
      // console.log('Received cart data:', size);
      await addtToCartModel.create(data)
      res.json({ message: 'Success' })
    } catch (error) {
      console.log('Error While save the shoppingCart Data!', error)
    }
  } else if (req.query.task === 'wishlist') {
    console.log('wishlist:', req.body.productID, userID)
    try {
      const details = {
        userID: userID,
        productID: req.body.productID
      }
      console.log(details)
      await wishlistSchema.create(details)
      res.json({ message: 'success' })
      // const wishlistExist = await wishlistSchema.findOne({ userID: userID, productID: req.body.productID });
      // console.log('wishlistExist : ',wishlistExist)
      // if(!wishlistEntry){
      //   console.log('!wishlistExist')
      //   await wishlistSchema.create(details)
      //   res.redirect('/profileMenu?menu=wishlist')

      // }else{
      //   console.log('iam in ')
      //   res.redirect('/profileMenu?menu=wishlist')
      // }

    } catch (error) {
      console.log(error)
    }
  } else if (req.query.task === 'Removewishlist') {
    // console.log('wishlist:', req.body.productID, userID)
    try {
      const productID = req.body.productID

      await wishlistSchema.deleteOne({ productID: productID, userID: userID })
      res.json({ message: 'success' })

    } catch (error) {
      console.log(error)
    }
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
// }



const checkOut = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID
  couponApplied = false

  console.log('couponApplied', couponApplied)
  try {
    if (req.query.task == 'checkWallet') {
      // console.log('checkWallet')
      const checkWallet = await walletSchema.findOne({ userID: userID }).sort({ added: -1 });
      res.json(checkWallet)
    } else {
      // console.log(userID)
      const cartDetails = await orderDetailsModel.find({ userID: userID }).populate('productID')
      const userInfo = await addressModel.find({ userID: userID, selected: true })
      const addresses = await addressModel.find({ userID: userID })
      // console.log('cartDetails', cartDetails)
      res.render('user/checkOut', { cartDetails, userInfo, addresses })
    }

  } catch (error) {
    console.error("Error fetching cart products:", error);
  }
}


// const orderDetails = async (req, res) => {
//   const cartItems = JSON.parse(req.body.cartData);

//   try {
//     let data = cartItems.map(val => {
//       const { userID, productID, quantity, size, totalPrice } = val;
//       if (userID && productID._id && quantity && size && totalPrice) {
//         return {
//           userID: userID,
//           productID: productID._id,
//           quantity: quantity,
//           size: size,
//           price: totalPrice
//         };
//       }
//     }).filter(item => item); // Filter out undefined values

//     console.log('cartItems', data);

//     const itemsToCreate = [];

//     for (const item of data) {
//       const productExists = await orderDetailsModel.exists({
//         userID: item.userID,
//         productID: item.productID,
//         quantity: item.quantity,
//         size: item.size,
//         totalPrice: item.price
//       });

//       if (!productExists) {
//         itemsToCreate.push(item);
//         await orderDetailsModel.insertMany(itemsToCreate);
//       }
//     }


//     res.redirect('/checkOut');
//   } catch (error) {
//     console.error('Error processing cart items:', error);
//     // Handle error appropriately, perhaps send an error response
//     res.status(500).send('Error processing cart items');
//   }


// }
const orderDetails = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID

  try {

    const cartItems = JSON.parse(req.body.cartData);
    await orderDetailsModel.deleteMany({ userID: userID });
    console.log('cartItems', cartItems)
    for (const item of cartItems) {
      const { userID, productID, quantity, size, totalPrice } = item;

      await orderDetailsModel.create({
        userID: userID,
        productID: productID._id,
        quantity: quantity,
        size: size,
        totalPrice: req.body.total,
        totalMRP: item.totalMRP,
        discount: req.body.discountAmt
      });

    }

    res.json({ message: 'success' })



  } catch (error) {
    console.error('Error processing cart items:', error);
    res.status(500).send('Error processing cart items');
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
  } else if (req.query.task === 'incQuantity') {

    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token);

    console.log(req.body.id)

    const data = await orderDetailsModel.findById(req.body.id).populate('productID')
    console.log(data, ": summarydata")
    // const productID = summarydata.productID._id
    // const data = productModel.findById(productID)
    let productSize = data.productID.ProductSize;
    // console.log('data', productSize)
    let b;
    let filter = productSize.filter((val, i) => {
      if (val.size === data.size) {
        // console.log('index :', val.quantity)
        b = val.quantity;
      }
      return b;
    })
    console.log('b : size :', data.quantity + 1, b)

    if (req.body.type === 'increment') {
      if (data.quantity + 1 <= b) {
        console.log('i am heree')
        // console.log('data[0].productID.SalesRate * req.body.newQty', data.productID.SalesRate * req.body.newQty);
        const updateddata = await orderDetailsModel.findByIdAndUpdate(req.body.id, { $set: { quantity: req.body.newQty, totalMRP: data.productID.MRP * req.body.newQty } })
        res.json(updateddata)
      } else {
        let limit = 'finished'
        res.json(limit)
      }
    } else if (req.body.type === 'decrement') {
      // console.log('data[0].productID.SalesRate * req.body.newQty', data.productID.SalesRate * req.body.newQty);
      const updateddata = await orderDetailsModel.findByIdAndUpdate(req.body.id, { $set: { quantity: req.body.newQty, totalMRP: data.productID.MRP * req.body.newQty } })
      res.json(updateddata)
    }

  }
}



const checkOutTasks = async (req, res) => {
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID
  if (req.query.task === 'removeProducts') {
    try {
      const orderSummaryId = req.body.id;
      console.log(orderSummaryId)
      await orderDetailsModel.deleteMany({ _id: orderSummaryId })
      res.redirect('/checkOut');
    } catch (error) {
      console.log(error)
    }

  } else if (req.query.task === 'walletPayment') {
    const paymentMethod = req.body.paymentMethod;
    const ProductData = JSON.parse(req.body.ProductData);
    const addressID = req.body.addressID;
    console.log('i am here...', ProductData)

    try {
      let details;
      const orderDetails = ProductData.map((val) => {
        return details = {
          userID: val.userID,
          productID: val.productID._id,
          addressID: addressID,
          Quantity: val.quantity,
          Amount: req.body.total,
          Size: val.size,
          PaymentMethod: paymentMethod
        }
      })

      ProductData.forEach(async element => {
        await addtToCartModel.findByIdAndDelete(element.productID._id)
      })

      const orderData = await orderSchema.create(orderDetails);

      const order = await Promise.all(ProductData.map(async (val, i) => {
        const checkWallet = await walletSchema.findOne({ userID: val.userID }).sort({ added: -1 });
        console.log('checkWallet :', checkWallet)
        const balance = checkWallet ? checkWallet.balance - req.body.total : orderData[i].Amount;

        return {
          userID: val.userID,
          productID: val.productID._id,
          orderID: orderData[i]._id,
          balance: balance,
          transaction: 'Debit'
        };
      }));

      console.log('wallet details :', order)




      console.log('details :', orderDetails[0].userID)

      let returnData;
      const UpdatedData = ProductData.map((val, index) => {
        return returnData = {
          ProductName: val.productID.ProductName,
          BrandName: val.productID.BrandName,
          CategoryName: val.productID.CategoryName,
          StockQuantity: val.productID.StockQuantity - val.quantity,
          subCategory: val.productID.subCategory,
          PurchaseRate: val.productID.PurchaseRate,
          SalesRate: val.productID.SalesRate,
          TotalPrice: val.productID.TotalPrice,
          ColorNames: val.productID.ColorNames,
          ProductDescription: val.productID.ProductDescription,
          VATAmount: val.productID.VATAmount,
          MRP: val.productID.MRP,
          ProductSize: [
            {
              size: val.productID.ProductSize[0].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[0].size ? val.productID.ProductSize[0].quantity - orderDetails[index].Quantity : val.productID.ProductSize[0].quantity
            },
            {
              size: val.productID.ProductSize[1].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[1].size ? val.productID.ProductSize[1].quantity - orderDetails[index].Quantity : val.productID.ProductSize[1].quantity
            },
            {
              size: val.productID.ProductSize[2].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[2].size ? val.productID.ProductSize[2].quantity - orderDetails[index].Quantity : val.productID.ProductSize[2].quantity
            },
            {
              size: val.productID.ProductSize[3].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[3].size ? val.productID.ProductSize[3].quantity - orderDetails[index].Quantity : val.productID.ProductSize[3].quantity
            },

          ],
          files: val.productID.files,
          Inventory: val.productID.Inventory,
          Added: val.productID.Added,
          SI: val.productID.SI
        }
      })

      console.log('UpdatedData  ', UpdatedData)
      const id = orderDetails[0].productID;
      await productModel.findByIdAndUpdate(id, UpdatedData[0], { new: true });

      for (const element of ProductData) {
        // console.log('element.productID._id : ', element.productID._id);
        const orderDetails = await orderDetailsModel.deleteMany({ productID: element.productID._id });
        const addToCart = await addtToCartModel.deleteMany({ productID: element.productID._id });

      }

      await walletSchema.create(order)
      // res.redirect('/profileMenu?menu=myOrders')
    } catch (error) {
      console.log(error)
    }
  }
  else if (req.query.task === 'RazorPay') {

    console.log('AppliedCode ', req.body.AppliedCode)
    const paymentMethod = req.body.paymentMethod;
    const ProductData = JSON.parse(req.body.ProductData);
    const addressID = req.body.addressID;
    const couponDiscount = req.body.couponDiscount
    const productCount = couponDiscount / ProductData.length;
    console.log('i am here...', ProductData, couponDiscount, productCount)

    const couponData = {
      userID: userID,
      couponCode: req.body.AppliedCode
    }


    await appliedCoupon.create(couponData)

    try {
      let details;
      const orderDetails = ProductData.map((val) => {
        const discountAmt = parseFloat(val.productID.SalesRate * productCount / 100)
        return details = {
          userID: val.userID,
          productID: val.productID._id,
          addressID: addressID,
          Quantity: val.quantity,
          Amount: val.productID.SalesRate - discountAmt,
          Size: val.size,
          PaymentMethod: paymentMethod,
          couponDiscount: productCount
        }
      })
      console.log('details :', orderDetails[0].userID)

      let returnData;
      const UpdatedData = ProductData.map((val, index) => {
        return returnData = {
          ProductName: val.productID.ProductName,
          BrandName: val.productID.BrandName,
          CategoryName: val.productID.CategoryName,
          StockQuantity: val.productID.StockQuantity - val.quantity,
          subCategory: val.productID.subCategory,
          PurchaseRate: val.productID.PurchaseRate,
          SalesRate: val.productID.SalesRate,
          TotalPrice: val.productID.TotalPrice,
          ColorNames: val.productID.ColorNames,
          ProductDescription: val.productID.ProductDescription,
          VATAmount: val.productID.VATAmount,
          MRP: val.productID.MRP,
          ProductSize: [
            {
              size: val.productID.ProductSize[0].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[0].size ? val.productID.ProductSize[0].quantity - orderDetails[index].Quantity : val.productID.ProductSize[0].quantity
            },
            {
              size: val.productID.ProductSize[1].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[1].size ? val.productID.ProductSize[1].quantity - orderDetails[index].Quantity : val.productID.ProductSize[1].quantity
            },
            {
              size: val.productID.ProductSize[2].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[2].size ? val.productID.ProductSize[2].quantity - orderDetails[index].Quantity : val.productID.ProductSize[2].quantity
            },
            {
              size: val.productID.ProductSize[3].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[3].size ? val.productID.ProductSize[3].quantity - orderDetails[index].Quantity : val.productID.ProductSize[3].quantity
            },

          ],
          files: val.productID.files,
          Inventory: val.productID.Inventory,
          Added: val.productID.Added,
          SI: val.productID.SI
        }
      })

      console.log('UpdatedData  ', UpdatedData)
      const id = orderDetails[0].productID;
      await productModel.findByIdAndUpdate(id, UpdatedData[0], { new: true });

      for (const element of ProductData) {
        // console.log('element.productID._id : ', element.productID._id);
        const orderDetails = await orderDetailsModel.deleteMany({ productID: element.productID._id });
        const addToCart = await addtToCartModel.deleteMany({ productID: element.productID._id });

      }

      const orderData = await orderSchema.create(orderDetails)

      // res.redirect('/profileMenu?menu=myOrders')
    } catch (error) {
      console.log(error)
    }

  }
  else if (req.query.task === 'saveOrderDetails') {

    const paymentMethod = req.body.paymentMethod;
    const ProductData = JSON.parse(req.body.ProductData);
    const addressID = req.body.addressID;
    const couponDiscount = req.body.couponDiscount
    const partialCount = couponDiscount / ProductData.length;


    console.log('i am here...', ProductData, couponDiscount, partialCount)

    try {
      let details;
      const orderDetails = ProductData.map((val) => {
        const discountAmt = parseFloat(val.productID.SalesRate * partialCount / 100)
        return details = {
          userID: val.userID,
          productID: val.productID._id,
          addressID: addressID,
          Quantity: val.quantity,
          Amount: val.productID.SalesRate - discountAmt,
          Size: val.size,
          PaymentMethod: paymentMethod,
          couponDiscount: partialCount
        }
      })
      console.log('details :', orderDetails[0].userID)

      let returnData;
      const UpdatedData = ProductData.map((val, index) => {
        return returnData = {
          ProductName: val.productID.ProductName,
          BrandName: val.productID.BrandName,
          CategoryName: val.productID.CategoryName,
          StockQuantity: val.productID.StockQuantity - val.quantity,
          subCategory: val.productID.subCategory,
          PurchaseRate: val.productID.PurchaseRate,
          SalesRate: val.productID.SalesRate,
          TotalPrice: val.productID.TotalPrice,
          ColorNames: val.productID.ColorNames,
          ProductDescription: val.productID.ProductDescription,
          VATAmount: val.productID.VATAmount,
          MRP: val.productID.MRP,
          ProductSize: [
            {
              size: val.productID.ProductSize[0].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[0].size ? val.productID.ProductSize[0].quantity - orderDetails[index].Quantity : val.productID.ProductSize[0].quantity
            },
            {
              size: val.productID.ProductSize[1].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[1].size ? val.productID.ProductSize[1].quantity - orderDetails[index].Quantity : val.productID.ProductSize[1].quantity
            },
            {
              size: val.productID.ProductSize[2].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[2].size ? val.productID.ProductSize[2].quantity - orderDetails[index].Quantity : val.productID.ProductSize[2].quantity
            },
            {
              size: val.productID.ProductSize[3].size,
              quantity: orderDetails[index].Size === val.productID.ProductSize[3].size ? val.productID.ProductSize[3].quantity - orderDetails[index].Quantity : val.productID.ProductSize[3].quantity
            },

          ],
          files: val.productID.files,
          Inventory: val.productID.Inventory,
          Added: val.productID.Added,
          SI: val.productID.SI
        }
      })

      console.log('UpdatedData  ', UpdatedData)
      const id = orderDetails[0].productID;
      await productModel.findByIdAndUpdate(id, UpdatedData[0], { new: true });

      for (const element of ProductData) {
        // console.log('element.productID._id : ', element.productID._id);
        const orderDetails = await orderDetailsModel.deleteMany({ productID: element.productID._id });
        const addToCart = await addtToCartModel.deleteMany({ productID: element.productID._id });
      }
      const orderData = await orderSchema.create(orderDetails)

      // res.redirect('/profileMenu?menu=myOrders')
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
  } else if (req.query.task === 'checkCoupon') {
    try {

      const currentDate = new Date(); // Get today's date
      const couponExist = await couponModel.findOne({
        couponCode: req.body.couponCode,
        Expire: { $gte: currentDate },
        status: 'Listed'
      });

      const cartData = await addtToCartModel.find({ userID: userID })

      const couponUsed = await appliedCoupon.findOne({ couponCode: req.body.couponCode })
      console.log('couponUsed : ', couponApplied, couponExist)
      if (couponApplied === false) {

        if (couponExist) {

          if (!couponUsed) {
            console.log('iam in couponExist', couponExist.discountAmount)
            couponApplied = true;
            res.json({ message: couponExist.discountAmount })
          } else {
            res.json({ error: 'Coupon Is Already Applied', message: couponExist.discountAmount })
            console.log('already couponExist')
          }

        } else {
          res.json({ error: 'Coupon Is Already Expired' })
          console.log('already couponExist')
        }

      } else {
        res.json({ error: 'Coupon Is Already Applied', message: couponExist.discountAmount })
        console.log('already couponApplied')
      }

    } catch (error) {
      console.log(error)
    }
  } else {
    res.render('user/404Error')
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
  console.log('iam in change email')
  const token = req.cookies.jwtUser; // Assuming token is stored in cookies
  const userID = verifyToken(token); // Verify token and get userID
  const oldEmail = await UserModel.findById(userID, { _id: 0, emailAddress: 1 });
  const emailAddress = oldEmail.emailAddress;
  if (req.query.task === 'checkEmailotp') {
    try {
      console.log(req.body.NewOTP)
      const newOTP = req.body.NewOTP
      const newEmail = req.body.newEmail;
      const response = await OTPModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);
      console.log(response[0].otp, 'dshsdsdmn :', newOTP)

      if (newOTP === response[0].otp) {
        await UserModel.findByIdAndUpdate(userID, { $set: { emailAddress: newEmail } })
        res.json({ message: 'success' })
      } else {
        res.json({ message: 'error' })
      }
    } catch (error) {
      console.log(error)
    }
  }
  else if (req.query.task === 'changePassword') {
    try {
      console.log('iam in change password')
      const oldPassword = req.body.oldPassword;
      const newPassword = req.body.newPassword;
      const Password = await UserModel.findById(userID, { _id: 0, password: 1 })
      console.log('correct password')
      const isPasswordMatch = await bcrypt.compare(oldPassword, Password.password)
      let hashedPassword;
      if (isPasswordMatch) {

        hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log(hashedPassword, ' : hashedPassword')
        await UserModel.findByIdAndUpdate(userID, { $set: { password: hashedPassword } })
        res.json({ message: 'Success' })
      } else {
        res.json({ message: 'error' })
      }


    } catch (error) {
      console.log(error)
    }
  } else if (req.query.task === 'changeinfo') {
    console.log('hi bro', req.body.fullName, req.body.mobileNo)
    // const newData = {
    //   $set: {
    //     fullName: req.body.fullName,
    //     phoneNo: req.body.mobileNo,
    //   }
    // };

    const result = await UserModel.findByIdAndUpdate(userID, { $set: { userName: req.body.fullName, phoneNo: req.body.mobileNo } });
    console.log(result)
    res.redirect('/Profile')
  }

}

const profileTasks = async (req, res) => {
  try {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token);

    console.log(req.body.newEmailAddress)
    const newEmail = req.body.newEmailAddress;

    const oldEmail = await UserModel.findById(userID, { _id: 0, emailAddress: 1 });
    console.log(oldEmail)
    const emailAddress = oldEmail.emailAddress;
    if (newEmail === oldEmail.emailAddress) {
      res.json({ message: 'SameEmail' })
    } else {
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
      res.json({ message: 'success' })
    }

  } catch (error) {
    console.log(error)
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
    res.render('user/enterOtp', { message: '', timer: '2:00' })//render the enterotp page
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
    console.log(GlobalUser.emailAddress)
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
    res.render('user/enterOtp', { message: '', timer: '2:00' })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
//..................................................................................................................................................

//save the user data to mongodb when the user enter the correct otp.
const createUser = async (req, res) => {
  let timer = req.body.Timer;
  console.log(req.body.otp)
  try {
    const emailAddress = GlobalUser.emailAddress
    const password = GlobalUser.password

    const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body
    const combinedOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
    // const combinedOTP = req.body.otp
    // Find the most recent OTP for the email
    const response = await OTPModel.find({ emailAddress }).sort({ createdAt: -1 }).limit(1);
    // console.log( response[0].otp, 'dshsdsdmn :', otp, combinedOTP)

    if (combinedOTP !== response[0].otp) {
      console.log(timer)
      console.log(combinedOTP);
      console.log(' i am heree at otp')
      res.render('user/enterOtp', { message: 'Invalid OTP', timer: '2:00' })
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
      const createdUser = await UserModel.create(GlobalUser);

      console.log('createdUser._id', createdUser._id)
      const Token = createToken(createdUser._id)
      res.cookie('jwtUser', Token, { httpOnly: true, maxAge: MaxExpTime * 1000 });

      res.redirect('/')
    }

  } catch (error) {
    // console.log(error.message);
    res.render('user/enterOtp', { message: 'OTP Time Out', timer: timer })
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
      res.render('user/enterOtp', { message: 'Invalid OTP', timer: '2:00' })
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
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token); // Verify token and get userID

    const id = req.query.id
    const ProductData = await productModel.find({ _id: id })
    const cart = await addtToCartModel.find({ userID: userID, productID: id })
    const wishListExist = await wishlistSchema.find({ userID: userID, productID: id }, 'productID');
    let isWishlisted = false;
    if(wishListExist.length > 0){
      isWishlisted = true;
    }
    console.log('cart ', cart,wishListExist)

    const productColor = await productModel.find({ ProductName: ProductData[0].ProductName })
    const firstProduct = ProductData[0];
    const CategoryName = firstProduct.CategoryName;
    const relatedItem = await productModel.find({ CategoryName: CategoryName })
    res.render('user/productOverview', { ProductData, relatedItem, productColor, cart ,isWishlisted})
  } catch (error) {
    console.log(error)
  }
}

const updateCart = async (req, res) => {
  try {
    const token = req.cookies.jwtUser; // Assuming token is stored in cookies
    const userID = verifyToken(token);


    const data = await addtToCartModel.findById(req.body.id).populate('productID')

    let productSize = data.productID.ProductSize;
    // console.log('data', productSize)
    let b;
    let filter = productSize.filter((val, i) => {
      if (val.size === data.size) {
        // console.log('index :', val.quantity)
        b = val.quantity;
      }
      return b;
    })
    console.log('b : size :', data.quantity + 1, b)

    if (req.body.type === 'increment') {
      if (data.quantity + 1 <= b) {
        // console.log('data[0].productID.SalesRate * req.body.newQty', data.productID.SalesRate * req.body.newQty);
        const updateddata = await addtToCartModel.findByIdAndUpdate(req.body.id, { $set: { quantity: req.body.newQty, totalPrice: data.productID.SalesRate * req.body.newQty, totalMRP: data.productID.MRP * req.body.newQty } })
        res.json(updateddata)
      } else {
        let limit = 'finished'
        res.json(limit)
      }
    } else if (req.body.type === 'decrement') {
      // console.log('data[0].productID.SalesRate * req.body.newQty', data.productID.SalesRate * req.body.newQty);
      const updateddata = await addtToCartModel.findByIdAndUpdate(req.body.id, { $set: { quantity: req.body.newQty, totalPrice: data.productID.SalesRate * req.body.newQty, totalMRP: data.productID.MRP * req.body.newQty } })
      res.json(updateddata)
    }



  } catch (error) {
    console.log(error)
  }
}

//Section for Post Method End here.....

//.................................................................................................................................................


//export all the above functions
module.exports = {
  registerPage, removeCartProduct, updateCheckout, landingPage, loginPage, userLogin,
  logout, profile, profileMenu, google, shoppingCart, updateCart, sendEmailOtp, postsendEmailOtp,
  forgotEnterOtp, postForgotEnterOtp, resetPassword, createPassword, saveUserAddress, filterProducts,
  enterOtp, sentOTP, createUser, resendOtp, productOverview, saveImage, overviewFilter, checkOut,
  checkOutTasks, orderDetails, updateProfile, onlinPayment, verifyPayment, priceFilter, DeleteData,
  profileTasks
}