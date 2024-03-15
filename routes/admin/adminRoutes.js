const express = require('express')
const router = express.Router()
const {
    adminLogin, adminLoginPost, productList, productListEdit,
    addProductsPost, adminDashboard, CustomerDetails, categoryPost,
    categoryEdit, updateUser, productSearch, Category, postAddCategory,
    postEditProduct, logout,CustomerFilter,deleteInventory
} = require('../../controller/admin/adminController.js')
const upload = require('../../controller/admin/multer.js')
const adminAuth = require('../../middlewares/adminMiddleware.js')


router.route('/').get(adminAuth, adminLogin).post(adminLoginPost)//loginpage page
router.route('/adminDashboard').get(adminDashboard)//dashboard page
router.route('/ProductList').get(productList).post(productListEdit)//productlist page
router.route('/ProductList/addProducts').get(productList).post(upload.array('images'), addProductsPost)//addProducts page
router.route('/ProductList/editProducts').get(productList).put(upload.array('images'), postEditProduct)//editProducts page
router.route('/ProductList/deleteInventory').delete(deleteInventory)
router.route('/CustomerDetails').get(CustomerDetails).patch(updateUser)//customer page//CustomerFilter//listed and unlisted incustomer page
router.route('/CustomerFilter').get(CustomerFilter)
router.route('/ProductList/search').post(productSearch)//productlist search par
router.route('/Category').get(Category).post(categoryPost)//category page
router.route('/Category/:id').get(Category).put(upload.array('images'), categoryEdit)//editCategory page
router.route('/addCategory').get(Category).post(upload.array('images'), postAddCategory)//addcategory page
router.route('/adminLogout').get(logout)//logout

module.exports = router  