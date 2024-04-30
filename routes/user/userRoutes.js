const express = require('express')
const router = express.Router()
const {
    registerPage, removeCartProduct, updateCheckout, landingPage, loginPage, userLogin,
    logout, profile, profileMenu, google, shoppingCart, updateCart, sendEmailOtp, postsendEmailOtp,
    forgotEnterOtp, postForgotEnterOtp, resetPassword, createPassword, saveUserAddress, filterProducts,
    enterOtp, sentOTP, createUser, resendOtp, productOverview, saveImage, overviewFilter, checkOut,
    checkOutTasks, orderDetails, updateProfile,onlinPayment,verifyPayment,priceFilter,DeleteData
} = require("../../controller/user/userConroller.js");

const { userAuth } = require('../../middlewares/authMiddleware.js')
const passport = require('passport')
require('../../controller/user/googleOuath.js')
const jwt = require('jsonwebtoken');
const { loginAuth } = require('../../middlewares/loginMiddleware.js')


router.route('/').get(landingPage)//landinglage 
router.route('/register').get(registerPage).post(sentOTP)//user registration 
router.route('/enterOtp').get(userAuth,enterOtp).post(createUser)//enterOtp
router.route('/login').get(loginAuth,loginPage).post(userLogin)//loginpage
router.route('/google').get(passport.authenticate('google', { scope: ['profile', 'email'] }))
router.route('/google/redirect').get(passport.authenticate('google'), (req, res) => {
    const token = jwt.sign(
        { user: req.user },
        process.env.JWT_SECRET || '',
        { expiresIn: "50h" },
    );
    res.cookie('jwtUser', token);
    res.redirect('/')
})
router.route('/shoppingcart').get(userAuth, shoppingCart).post(orderDetails).patch(updateCart).delete(removeCartProduct)//shoppingcart 
router.route('/sendEmailOtp').get(userAuth,sendEmailOtp).post(postsendEmailOtp)//enter email page to send otp for forgotpassword
router.route('/forgotEnterOtp').get(forgotEnterOtp).post(postForgotEnterOtp)// Enter otp for forgotpassword
router.route('/resetPassword').get(resetPassword).patch(createPassword)// resetpassword page
router.route('/resendOtp').post(resendOtp)//resend otp 
router.route('/productOverview').get(productOverview).post(overviewFilter)//productOverview 
router.route('/allProducts').get(landingPage).post(priceFilter)//allProducts
router.route('/filterProducts').get(filterProducts)
router.route('/filterCategory').get(landingPage)//listCategory
router.route('/Profile').get(userAuth, profile).patch(updateProfile)
router.route('/checkOut').get(userAuth, checkOut).post(checkOutTasks).put(updateCheckout)
router.route('/logout').get(logout)//logout
router.route('/profileMenu').get(userAuth,profileMenu).post(saveUserAddress).put(saveUserAddress).delete(DeleteData)
router.route('/create-payment').post(onlinPayment)
router.route('/verify-Payment').post(verifyPayment)
module.exports = router