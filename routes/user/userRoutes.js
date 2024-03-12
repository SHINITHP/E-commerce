const express = require('express')
const router = express.Router()
const  {
    landingPage,
    loginPage,
    userLogin,
    profile,
    shoppingCart,
    sendEmailOtp,
    postsendEmailOtp,
    forgotEnterOtp,
    postForgotEnterOtp,
    resetPassword,
    createPassword,
    registerPage,
    logout,
    createUser,
    enterOtp,
    sentOTP,
    resendOtp,
    productOverview
} = require( "../../controller/userConroller.js" );
const {userAuth} = require('../../middlewares/authMiddleware.js')


 
router.route('/').get(landingPage);//landinglage
router.route('/register').get(registerPage).post(sentOTP)//user registration 
router.route('/enterOtp').get(enterOtp).post(createUser)//enterOtp
router.route('/login').get(userAuth,loginPage).post(userLogin)//loginpage
router.route('/shoppingcart').get(userAuth,shoppingCart)//shoppingcart 
router.route('/sendEmailOtp').get(sendEmailOtp).post(postsendEmailOtp)//enter email page to send otp for forgotpassword
router.route('/forgotEnterOtp').get(forgotEnterOtp).post(postForgotEnterOtp)// Enter otp for forgotpassword
router.route('/resetPassword').get(resetPassword).patch(createPassword)// resetpassword page
router.route('/resendOtp').post(resendOtp)//resend otp 
router.route('/productOverview').get(productOverview)//productOverview 
router.route('/allProducts').get(landingPage)//allProducts
router.route('/filterCategory').get(landingPage)//listCategory
router.route('/Profile').get(profile)//profile
router.route('/logout').get(logout)//logout





module.exports = router