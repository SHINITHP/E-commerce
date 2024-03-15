const UserModel = require('../../models/user/registerSchema.js')
const ProductModel = require('../../models/admin/productModel.js')
const bcrypt = require('bcrypt')
const cloudinary = require('../admin/cloudinary.js')
const fs = require('fs')
const productModel = require('../../models/admin/productModel.js')
const subCategorySchema = require('../../models/admin/category.js')
const jwt = require('jsonwebtoken');
require('dotenv').config()

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
const adminLogin = (req, res) => {
    res.render('admin/adminLogin', { message: "" })
}

//adminDashboard get method
const adminDashboard = (req, res) => {
    res.render('admin/adminDashboard')
}


//prductlist get method
const productList = async (req, res) => {
    if (req.path === '/ProductList') {
        const productDetails = await productModel.find({})
        res.render('admin/ProductList', { productDetails, message: ' ' })
    }
    else if (req.path === '/ProductList/addProducts') {
        const subCategory = await subCategorySchema.distinct('subCategory');
        // console.log(subCategory);
        res.render('admin/addProducts', { subCategory, success: '' })
    }
    else if (req.path === '/ProductList/editProducts') {
        const subCategory = await subCategorySchema.distinct('subCategory');
        const productInfo = await ProductModel.findById(req.query.id)
        // console.log(productInfo);
        res.render('admin/editProducts', { subCategory, productInfo, success: '' })
    }

}

//CustomerDetails get Request
const CustomerDetails = async (req, res) => {
    const users = await UserModel.find({})
    console.log(users);
    res.render('admin/CustomerDetails', { users })
}


//CustomerDetails get Request
const CustomerFilter = async (req, res) => {

    if (req.query.filter == "all") {
        const users = await UserModel.find({})
        console.log(req.query.filter);
        res.render('admin/CustomerDetails', { users })
    }
    else if (req.query.filter == "active") {
        const users = await UserModel.find({ status: true })
        console.log(req.query.filter);
        res.render('admin/CustomerDetails', { users })
    }
    else if (req.query.filter == "blocked") {
        const users = await UserModel.find({ status: false })
        console.log(req.query.filter);
        res.render('admin/CustomerDetails', { users })
    }

}


//Category page get Request
const Category = async (req, res) => {
    if (req.path === '/Category') {
        const categoryData = await subCategorySchema.find({})
        // console.log(categoryData);
        res.render('admin/Category', { categoryData })
    }
    else if (req.path === '/addCategory') {
        res.render('admin/addCategory', { success: '' })
    }
    else if (req.params.id) {
        const categoryData = await subCategorySchema.findById(req.params.id);
        // console.log(categoryData);
        res.render('admin/editCategory', { categoryData, success: '' })
    }
}


//Logout get Request
const logout = (req, res) => {
    res.clearCookie('jwtAdmin');
    res.redirect('/adminLogin')
}


//Section for GET Request End here.......

//..................................................................................................................................................

//Section for Post Method Starts here.....


//adminlogin post method
const adminLoginPost = async (req, res) => {

    try {
        const { emailAddress, Password } = req.body
        // console.log(emailAddress);
        const adminExist = await UserModel.findOne({ emailAddress })
        if (adminExist.emailAddress == emailAddress) {
            const isAdmin = adminExist.isAdmin;
            // console.log('.....!!', isAdmin);
            if (isAdmin) {
                const isPasswordMatch = await bcrypt.compare(Password, adminExist.password)
                if (isPasswordMatch) {
                    const Token = createToken(adminExist._id)
                    res.cookie('jwtAdmin', Token, { httpOnly: true, maxAge: MaxExpTime * 1000 });
                    res.redirect('adminLogin/adminDashboard')
                } else {
                    res.render('admin/adminLogin', { message: 'Invalid Password!' })
                }
            } else {
                res.render('admin/adminLogin', { message: 'Access Denied' })
            }
        } else {
            res.render('admin/adminLogin', { message: 'Entered  Email Address is Invalid!' })
        }
    } catch (error) {
        console.log('Error while login : ', error);
        //res.render('user/login', { error: "Error while login" })
    }

}
//..................................................................................................................................................

//for listed and unlisted in ProductList page
const productListEdit = async (req, res) => {
    // console.log(req.query.ID);
    try {
        const product = await ProductModel.findById(req.query.ID)
        console.log(product);
        if (product.Inventory === "Listed") {
            await ProductModel.findByIdAndUpdate(req.query.ID, { Inventory: 'Unlisted' })
            res.redirect('/adminLogin/ProductList')
        }
        else if (product.Inventory === "Unlisted") {
            await ProductModel.findByIdAndUpdate(req.query.ID, { Inventory: 'Listed' })
            res.redirect('/adminLogin/ProductList')
        }
    } catch (error) {
        console.log(error);
    }

}
//..................................................................................................................................................

//Post method for ProductList search
const productSearch = async (req, res) => {
    try {
        const searchedData = req.body.search
        const productDetails = await productModel.find({ ProductName: searchedData })
        const subCategory = await subCategorySchema.find({})
        if (productDetails == "") {
            console.log('empty');
            res.render('admin/ProductList', { productDetails, message: 'No Result Found!' })
        } else {
            console.log('hiii iam here');
            res.render('admin/ProductList', { productDetails, message: ' ' })
        }
    } catch (error) {
        console.log('Error from ProductSearch ', error);
    }
}
//..................................................................................................................................................

//Post method for AddProducts page
const addProductsPost = async (req, res) => {
    try {
        //Uploading image to Clouddinary
        const uploader = async (path) => await cloudinary.uploads(path, 'Images')
        if (req.method === 'POST') {
            const urls = []
            const files = req.files
            for (const file of files) {
                const { path } = file
                try {
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                } catch (uploadError) {
                    console.error('Error uploading file to Cloudinary:', uploadError)
                    return res.status(500).json({ error: 'Failed to upload images' })
                }
            }
            // requseting all the data from the body
            const {
                ProductName, BrandName, CategoryName, StockQuantity, subCategory,
                PurchaseRate, SalesRate, TotalPrice, ColorNames,
                ProductDescription, VATAmount, DiscountPrecentage, sizes
            } = req.body

            // Prepare sizes array
            const ProductSize = sizes.map((size, index) => ({
                size,
                quantity: req.body.SizeQuantity[index]
            }));

            //assigning all the reqested data to product variable
            const Products = {
                ProductName, BrandName, CategoryName, StockQuantity, subCategory,
                PurchaseRate, SalesRate, TotalPrice, ColorNames, ProductDescription,
                VATAmount, DiscountPrecentage, ProductSize, files: urls
            }

            try {
                // console.log(Products);
                await ProductModel.create(Products);
                const subCategory = await subCategorySchema.distinct('subCategory');
                res.render('admin/addProducts', { subCategory, success: 'Product Added Successfully' })
            } catch (saveError) {
                console.error('Error saving product to database:', saveError)
                res.status(500).json({ error: 'Failed to save product to database' })
            }
        } else {
            res.status(405).json({
                error: 'Images not uploaded!'
            })
        }
    } catch (error) {
        console.log('Admin controller error:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
//..................................................................................................................................................

//Post method for editProducts page
const postEditProduct = async (req, res) => {
    try {
        //Uploading image to Clouddinary
        const uploader = async (path) => await cloudinary.uploads(path, 'Images')
        const urls = []

        const files = req.files

        if (req.files.length > 0) {

            for (const file of files) {
                const { path } = file

                try {
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                } catch (uploadError) {
                    console.error('Error uploading file to Cloudinary:', uploadError)
                    return res.status(500).json({ error: 'Failed to upload images' })
                }
            }
        }

        const imagePaths = urls.map(item => item.url);
        const finalImage = imagePaths.slice(0, 4)
        console.log(finalImage)
        console.log('final images   :::: ', urls)

        const oldData = await productModel.findById(req.query.id)
        console.log(oldData)
        const imgData = []
        imgData.push(oldData.files)

        // requseting all the data from the body
        const {
            ProductName, BrandName, CategoryName, StockQuantity, subCategory,
            PurchaseRate, SalesRate, TotalPrice, ColorNames,
            ProductDescription, VATAmount, DiscountPrecentage, sizes
        } = req.body

        // Prepare sizes array
        const ProductSize = sizes.map((size, index) => ({
            size,
            quantity: req.body.SizeQuantity[index]
        }));
        //assigning all the reqested data to product variable
        const Products = {
            ProductName, BrandName, CategoryName, StockQuantity, subCategory,
            PurchaseRate, SalesRate, TotalPrice, ColorNames, ProductDescription,
            VATAmount, DiscountPrecentage, ProductSize, files: finalImage.length > 0 ? urls : oldData.files
        }
        //Save the updated data the database 
        try {
            console.log(Products);
            await ProductModel.findOneAndUpdate({ _id: req.params.id }, { $set: Products }).then((result) => {
                console.log('result :', result);
            }).catch(error => {
                console.log(error);
            });
            const subCategory = await subCategorySchema.distinct('subCategory');
            const productInfo = await ProductModel.findById(req.query.id)
            res.render('admin/editProducts', { subCategory, productInfo, success: 'Product Successfully Edited' })
        } catch (saveError) {
            console.error('Error saving product to database:', saveError)
            res.status(500).json({ error: 'Failed to save product to database' })
        }
    } catch (error) {
        console.log('Admin controller error:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
//..................................................................................................................................................

//listed and ulisted for CustomerDetails page
const updateUser = async (req, res) => {
    const user = await UserModel.findById(req.query.id)
    console.log('jhegwggtr  ', req.query.id)
    if (user.status === true) {
        await UserModel.findByIdAndUpdate(req.query.id, { status: false })
        res.clearCookie('jwtUser');//removing the cookies
        res.redirect('/adminLogin/CustomerDetails')
    }
    else if (user.status === false) {
        await UserModel.findByIdAndUpdate(req.query.id, { status: true })
        res.redirect('/adminLogin/CustomerDetails')
    }
}
//..................................................................................................................................................

//listed and unlisted for the Category Page
const categoryPost = async (req, res) => {
    const Inventory = req.query.Inventory
    if (Inventory) {
        const Category = await subCategorySchema.findById(Inventory)
        console.log(Category);
        if (Category.Inventory === "Listed") {
            await subCategorySchema.findByIdAndUpdate(Inventory, { Inventory: 'Unlisted' })
            res.redirect('/adminLogin/Category')
        }
        else if (Category.Inventory === "Unlisted") {
            await subCategorySchema.findByIdAndUpdate(Inventory, { Inventory: 'Listed' })
            res.redirect('/adminLogin/Category')
        }
    }
}
//..................................................................................................................................................

//Post method for the category page 
const categoryEdit = async (req, res) => {
    console.log(req.params.id);
    try {
        //Uploading image to Clouddinary
        const uploader = async (path) => await cloudinary.uploads(path, 'Images')
        const urls = []
        const files = req.files
        if (req.files.length > 0) {
            for (const file of files) {
                const { path } = file
                try {
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                } catch (uploadError) {
                    console.error('Error uploading file to Cloudinary:', uploadError)
                    return res.status(500).json({ error: 'Failed to upload images' })
                }
            }
        }
        const imagePaths = urls
        const finalImage = imagePaths
        const oldData = await subCategorySchema.findById(req.params.id)
        const imgData = []
        imgData.push(oldData.image)

        // requesting data form the body
        const {
            CategoryName,
            subCategory
        } = req.body
        //assigning reqested data to the category variable
        const category = {
            CategoryName,
            subCategory,
            image: finalImage.length > 0 ? urls : oldData.image
        }
        //save the updated data to the database
        try {
            console.log(category);
            await subCategorySchema.findOneAndUpdate({ _id: req.params.id }, { $set: category }).then((result) => {
                console.log('result :', result);
            }).catch(error => {
                console.log(error);
            });
            res.redirect('/adminLogin/Category')
        } catch (saveError) {
            console.error('Error saving product to database:', saveError)
            res.status(500).json({ error: 'Failed to save product to database' })
        }
    } catch (error) {
        console.log('Admin controller error:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
//..................................................................................................................................................

//Post method for addCategory page
const postAddCategory = async (req, res) => {
    try {
        const uploader = async (path) => await cloudinary.uploads(path, 'Images')
        if (req.method === 'POST') {
            const urls = []
            const files = req.files
            for (const file of files) {
                const { path } = file
                try {
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                } catch (uploadError) {
                    console.error('Error uploading file to Cloudinary:', uploadError)
                    return res.status(500).json({ error: 'Failed to upload images' })
                }
            }
            // requesting data from the body
            const { CategoryName, subCategory } = req.body

            const Category = {
                CategoryName,
                subCategory,
                image: urls
            }
            //add data to the database
            try {
                console.log(Category);
                await subCategorySchema.create(Category);
                res.render('admin/addCategory', { success: 'Category Added Successfully' })
            } catch (saveError) {
                console.error('Error saving product to database:', saveError)
                res.status(500).json({ error: 'Failed to save product to database' })
            }
        } else {
            res.status(405).json({
                error: 'Images not uploaded!'
            })
        }
    } catch (error) {
        console.log('Admin controller error:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

//delete products
const deleteInventory = async (req, res) => {
    if (req.query.delete === "Product") {
        if (req.query.id) {
            await productModel.findByIdAndDelete({ _id: req.query.id })
            res.redirect('adminLogin/ProductList')
        }
    }
}

//Section for Post Method End here.....
//.................................................................................................................................................


module.exports = {
    adminLogin,
    adminLoginPost,
    productList,
    productListEdit,
    categoryPost,
    addProductsPost,
    deleteInventory,
    adminDashboard,
    CustomerDetails,
    updateUser,
    productSearch,
    Category,
    CustomerFilter,
    postAddCategory,
    categoryEdit,
    postEditProduct,
    logout
}