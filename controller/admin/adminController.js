const UserModel = require('../../models/register.js')
const ProductModel = require('../../models/products.js')
const orderModel = require('../../models/order.js')
const bcrypt = require('bcrypt')
const cloudinary = require('../admin/cloudinary.js')
const fs = require('fs')
const productModel = require('../../models/products.js')
const subCategorySchema = require('../../models/category.js')
const walletSchema = require('../../models/wallet.js')
const couponSchema = require('../../models/coupon.js')
const offerSchema = require('../../models/offer.js')
const jwt = require('jsonwebtoken');
const path = require('path')
const mongoose = require('mongoose');
const { insertMany } = require('../../models/address.js')
require('dotenv').config()
const crypto = require('crypto')
var pdf = require("pdf-creator-node");
const { triggerAsyncId } = require('async_hooks')
// Read HTML Template
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

const offers = async (req, res) => {
    if (req.query.filter === 'All') {
        const offers = await offerSchema.find({}).populate('productID');
        // console.log(offers)
        res.render('admin/offers', { offers })
    } else if (req.query.filter === 'Listed') {
        const offers = await offerSchema.find({ status: 'Listed' }).populate('productID');
        // console.log(offers)
        res.render('admin/offers', { offers })
    }
    else if (req.query.filter === 'Unlisted') {
        console.log('Unlisted')
        const offers = await offerSchema.find({ status: 'Unlisted' }).populate('productID');
        // console.log(offers)
        res.render('admin/offers', { offers })
    }
    // else if(req.query.filter === 'customDate'){
    //     const startDate = req.query.startDate
    //     const endDate = req.query.endDate
    //     console.log('Unlisted')
    //     const offers = await offerSchema.find({ OrderDate: {
    //         $gte: new Date(startDate), // Start of the specified date range
    //         $lte: new Date(endDate) // End of the specified date range
    //     }}).populate('productID');
    //     // console.log(offers)
    //     res.render('admin/offers', { offers })
    // }
    else {
        console.log('normal')
        const offers = await offerSchema.find({}).populate('productID');
        // console.log(offers)
        res.render('admin/offers', { offers })
    }

}

const DeleteOffer = async (req, res) => {
    try {
        const productID = req.body.productID.split(',');
        const { id } = req.body
        console.log('Deleting offer with ID:', id, 'and productID:', productID);
        productID.forEach(async (val) => {
            await productModel.findByIdAndUpdate(val, { $set: { offer: 0 } })
        })
        await offerSchema.findByIdAndDelete(id)

        res.json({ message: 'success' })
    } catch (error) {
        console.log(error)
    }
}

const offerTasks = async (req, res) => {
    try {
        if (req.query.task === 'selectProduct') {
            const products = await productModel.find({ CategoryName: req.body.Category })
            res.json({ products })
        } else if (req.query.task === 'createOffer') {
            const title = req.body.title
            const percentage = req.body.percentage
            const Category = req.body.Category
            const selectedValues = req.body.selectedValues.map(id => new mongoose.Types.ObjectId(id));


            // console.log(selectedValues,': selectedValues')
            const data = {
                productID: selectedValues,
                categoryID: Category,
                title,
                percentage
            }

            await offerSchema.create(data)

            selectedValues.forEach(async (val) => {
                await productModel.findByIdAndUpdate(val, {
                    $set: {
                        offer: percentage
                    }
                })
            })


            res.json({ message: 'success' })
        }
    } catch (error) {
        console.log(error)
    }
}


const editOffer = async (req, res) => {
    try {

        if (req.query.task === 'changeStatus') {
            if (req.body.currStatus === 'Listed') {
                console.log(req.body.currStatus, req.body.id)
                const data = await offerSchema.findByIdAndUpdate(req.body.id, { $set: { status: 'Unlisted' } })
                let productIDs = data.productID;
                productIDs.forEach(async (val) => {
                    await productModel.findByIdAndUpdate(val, { $set: { offer: 0 } })
                })
                console.log(productIDs, ': productIDs')
                res.json({ message: 'success' })
            } else if (req.body.currStatus === 'Unlisted') {
                console.log(req.body.currStatus, req.body.id)
                const data = await offerSchema.findByIdAndUpdate(req.body.id, { $set: { status: 'Listed' } })
                let productIDs = data.productID;
                productIDs.forEach(async (val) => {
                    await productModel.findByIdAndUpdate(val, { $set: { offer: data.percentage } })
                })
                res.json({ message: 'success' })
            }
        }
    } catch (error) {
        console.log(error)
    }
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
    else if (req.path === '/editProducts') {
        const subCategory = await subCategorySchema.distinct('subCategory');
        const productInfo = await ProductModel.findById(req.query.id)
        // console.log(productInfo);
        res.render('admin/editProducts', { subCategory, productInfo, success: '' })
    }

}

//CustomerDetails get Request
const CustomerDetails = async (req, res) => {
    const users = await UserModel.find({}).select("-password")
    // console.log(users);
    res.render('admin/CustomerDetails', { users })
}


//CustomerDetails get Request
const CustomerFilter = async (req, res) => {

    if (req.query.filter == "all") {
        const users = await UserModel.find({}).select("-password")
        console.log(req.query.filter);
        res.render('admin/CustomerDetails', { users })
    }
    else if (req.query.filter == "active") {
        const users = await UserModel.find({ status: true }).select("-password")
        console.log(req.query.filter);
        res.render('admin/CustomerDetails', { users })
    }
    else if (req.query.filter == "blocked") {
        const users = await UserModel.find({ status: false }).select("-password")
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

const filterCategory = async (req, res) => {
    try {
        if (req.query.Category == 'All') {
            try {
                console.log(req.query.Category)
                const categoryData = await subCategorySchema.find({});
                res.render('admin/Category', { categoryData })
            } catch (error) {
                console.log(error)
            }

        }
        else if (req.query.task == 'subCat') {
            try {
                console.log(req.query.Category)
                const categoryData = await subCategorySchema.find({ CategoryName: req.query.Category });
                res.render('admin/Category', { categoryData })
            } catch (error) {
                console.log(error)
            }
        }
        else if (req.query.Category == 'search') {
            try {
                console.log('i am hereee bro ', req.query.text)
                let data = req.query.text;
                const searchText = new RegExp("^" + data, "i")
                console.log(searchText)
                const categoryData = await subCategorySchema.find({ subCategory: { $regex: searchText } })
                // console.log(categoryData)
                res.render('admin/Category', { categoryData })
            } catch (error) {
                console.log(error)
            }

        }
    } catch (error) {
        console.log(error)
    }

}

//Logout get Request
const logout = (req, res) => {
    res.clearCookie('jwtAdmin');
    res.redirect('/adminLogin')
}

const orderHistory = async (req, res) => {
    const orderDetails = await orderModel.find({})
        .populate('productID')
        .populate('userID')
        .populate('addressID')
    console.log('order details', orderDetails)
    res.render('admin/orderHistory', { orderDetails })
}


//Section for GET Request End here.......

//..................................................................................................................................................

//Section for Post Method Starts here.....


const OrderTasks = async (req, res) => {
    // console.log('i am here....')

    try {
        if (req.query.task === 'updateStatus') {
            const orderID = req.body.orderID
            const newStatus = req.body.orderStatus

            await orderModel.findByIdAndUpdate(orderID, { Status: newStatus })
        }
    } catch (error) {

    }
}

//adminlogin post method
const adminLoginPost = async (req, res) => {

    try {
        const { emailAddress, Password } = req.body

        const email = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;


        // console.log(emailAddress);
        // const adminExist = await UserModel.findOne({ emailAddress })
        if (emailAddress == email) {
            // const isAdmin = adminExist.isAdmin;
            // console.log('.....!!', isAdmin);
            // const isPasswordMatch = await bcrypt.compare(Password, adminExist.password)
            if (Password == adminPassword) {
                const Token = createToken(emailAddress)
                res.cookie('jwtAdmin', Token, { httpOnly: true, maxAge: MaxExpTime * 1000 });
                res.redirect('adminLogin/adminDashboard')
            } else {
                res.render('admin/adminLogin', { message: 'Invalid Password!' })
            }
        } else {
            res.render('admin/adminLogin', { message: 'Access Denied' })
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

const addImagesToCloudinary = async (imageUrls) => {
    try {


        for (const imageUrl of imageUrls) {
            // console.log('image url :', imageUrl)
            // Upload image directly from URL to Cloudinary
            const result = await cloudinary.uploads(imageUrl, 'Images');
            // Push the public URL of the uploaded image to the uploadedUrls array
            uploadedUrls.push(result.secure_url);
        }
        return uploadedUrls; // Return array of uploaded image URLs
    } catch (error) {
        console.error('Error uploading images to Cloudinary:', error);
        throw error; // Throw error for further handling
    }
};



//..................................................................................................................................................
const addProductsPost = async (req, res) => {
    try {
        const uploader = async (path) => await cloudinary.uploads(path, 'Images')
        const urls = [];
        const imageData = Array.isArray(req.body.imageLinks) ? req.body.imageLinks : [req.body.imageLinks];

        for (const imageUrl of imageData) {
            try {
                const newPath = await uploader(imageUrl);
                urls.push(newPath);
            } catch (error) {
                console.log(error)
            }
        }
        console.log('urls : ',urls);
        const {
            ProductName, BrandName, CategoryName, StockQuantity, subCategory,
            PurchaseRate, SalesRate, ColorNames,
            ProductDescription, VATAmount, mrp, sizes
        } = req.body

        // Prepare sizes array
        const ProductSize = sizes.map((size, index) => ({
            size,
            quantity: req.body.SizeQuantity[index]
        }));

        //assigning all the reqested data to product variable
        const Products = {
            ProductName, BrandName, CategoryName, StockQuantity, subCategory,
            PurchaseRate, SalesRate, ColorNames, ProductDescription,
            VATAmount, MRP: mrp, ProductSize, files: urls
        }
        //  console.log(Products);
        try {
            await ProductModel.create(Products);
            const subCategory = await subCategorySchema.distinct('subCategory');
            res.render('admin/addProducts', { subCategory, success: 'Product Added Successfully' })
        } catch (saveError) {
            console.error('Error saving product to database:', saveError)
            res.status(500).json({ error: 'Failed to save product to database' })
        }

    } catch (error) {
        console.error('Error adding products:', error);
        res.status(500).json({ error: 'Failed to add products' });
    }
};

//Post method for AddProducts page
// const addProductsPost = async (req, res) => {
//     try {
//         //Uploading image to Clouddinary
//         const uploader = async (path) => await cloudinary.uploads(path, 'Images')
//         if (req.method === 'POST') {
//             const urls = []
//             const files = req.files
//             for (const file of files) {
//                 const { path } = file
//                 try {
//                     const newPath = await uploader(path)
//                     urls.push(newPath)
//                     fs.unlinkSync(path)
//                 } catch (uploadError) {
//                     console.error('Error uploading file to Cloudinary:', uploadError)
//                     return res.status(500).json({ error: 'Failed to upload images' })
//                 }
//             }
//             // requseting all the data from the body
//             const {
//                 ProductName, BrandName, CategoryName, StockQuantity, subCategory,
//                 PurchaseRate, SalesRate, ColorNames,
//                 ProductDescription, VATAmount, mrp, sizes
//             } = req.body

//             // Prepare sizes array
//             const ProductSize = sizes.map((size, index) => ({
//                 size,
//                 quantity: req.body.SizeQuantity[index]
//             }));

//             //assigning all the reqested data to product variable
//             const Products = {
//                 ProductName, BrandName, CategoryName, StockQuantity, subCategory,
//                 PurchaseRate, SalesRate, ColorNames, ProductDescription,
//                 VATAmount, MRP: mrp, ProductSize, files: urls
//             }
//             //  console.log(Products);
//             try {

//                 await ProductModel.create(Products);
//                 const subCategory = await subCategorySchema.distinct('subCategory');
//                 res.render('admin/addProducts', { subCategory, success: 'Product Added Successfully' })
//             } catch (saveError) {
//                 console.error('Error saving product to database:', saveError)
//                 res.status(500).json({ error: 'Failed to save product to database' })
//             }
//         } else {
//             res.status(405).json({
//                 error: 'Images not uploaded!'
//             })
//         }
//     } catch (error) {
//         console.log('Admin controller error:', error)
//         res.status(500).json({ error: 'Internal Server Error' })
//     }
// }
// //..................................................................................................................................................


const postEditProduct = async (req, res) => {
    try {
        const oldData = await productModel.findById(req.query.id);

        const uploader = async (path) => await cloudinary.uploads(path, 'Images');
        const urls = []
        const files = req.files
        let index = [];


        console.log('files :', files)
        if (files.length > 0) {

            for (const file of files) {
                const { path } = file
                const { fieldname } = file;

                index.push(fieldname)
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
        // if (val === "images1") {
        //     item = val !== 'images1' ? oldData.files[0] : urls[0]
        // }
        // if (val === "images2") {
        //     item = val !== 'images2' ? oldData.files[1] : urls[1]
        // }
        // if (val === "images3") {
        //     item = val !== 'images3' ? oldData.files[2] : urls[2]
        // }
        // if (val === "images4") {
        //     item = val !== 'images4' ? oldData.files[3] : urls[3]
        // }

        let item1, item2, item3, item4, minUrlLen;

        console.log('index', index)
        let count = 0;

        let proData = [];
        let a = 0;
        for (let i = 0; i < 1; i++) {


            if (index[a] == 'images1') {
                console.log('urls[0]images1 : ', urls[count])
                item1 = urls[count];
                proData.push(item1)
                count++;
                a++;
                // item = val !== 'images4' ? oldData.files[3] : urls[3]
            } else {
                console.log(' iam in olddata1');
                item1 = oldData.files[0];
                proData.push(item1)

            }

            if (index[a] == 'images2') {
                console.log('urls[0]images2 : ', urls[count])
                item2 = urls[count];
                proData.push(item2)
                count++;
                a++;
            } else {
                console.log(' iam in olddata2');
                item2 = oldData.files[1];
                proData.push(item2)

            }


            if (index[a] == 'images3') {
                console.log('urls[0]images3 : ', urls[count])
                item3 = urls[count];
                proData.push(item3)
                count++;
                a++;
            } else {
                console.log(' iam in olddata3');
                item3 = oldData.files[2];
                proData.push(item3)

            }

            if (index[a] == 'images4') {
                console.log('urls[0]images4 : ', urls[count])
                item4 = urls[count];
                proData.push(item4)
                count++;
                a++;
            } else {
                console.log(' iam in olddata4');
                item4 = oldData.files[3];
                proData.push(item4)

            }


        }

        console.log('proData :', proData)



        const imgData = []
        imgData.push(oldData.files)

        const finalImage = urls;

        // requseting all the data from the body
        const {
            ProductName, BrandName, CategoryName, StockQuantity, subCategory,
            PurchaseRate, SalesRate, TotalPrice, ColorNames,
            ProductDescription, VATAmount, DiscountPrecentage, sizes
        } = req.body

        // Prepare sizes array
        let ProductSize = sizes.map((size, index) => ({
            size,
            quantity: req.body.SizeQuantity[index]
        }));
        //assigning all the reqested data to product variable


        const Products = {
            ProductName,
            BrandName,
            CategoryName,
            StockQuantity,
            subCategory,
            PurchaseRate,
            SalesRate,
            TotalPrice,
            ColorNames,
            ProductDescription,
            VATAmount,
            DiscountPrecentage,
            ProductSize,
            files: proData
        };

        try {
            await ProductModel.findOneAndUpdate({ _id: req.query.id }, { $set: Products }).then((result) => {
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
        console.log('Admin controller error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// const postEditProduct = async (req, res) => {
//     try {
//         const oldData = await productModel.findById(req.query.id);

//         const uploader = async (path) => await cloudinary.uploads(path, 'Images');
//         let urls = [];
//         const files = [req.files];
//         let finalImage,imagePaths;
//         console.log('files', files);
//         if (files.length > 0) {
//             console.log('iam here..... files.length > 0')
//             for (const file of files) {
//                 console.log('files', file);
//                 // const { path } = file;
//                 let path = [];
//                 for (let key in file) {
//                     path = [...path, file[key][0].path];
//                 }
//                 console.log("path :", path);


//                 try {
//                     path.forEach(async (item) => {
//                         // console.log(item);
//                         const newPath = await uploader(item);
//                         // console.log("np:",newPath);
//                         urls.push(newPath)
//                         finalImage = urls
//                         console.log("finalImage :",finalImage);
//                     })

//                     // console.log('urldata', file)
//                     // fs.unlinkSync(path);
//                 } catch (uploadError) {
//                     console.error('Error uploading file to Cloudinary:', uploadError);
//                     return res.status(500).json({ error: 'Failed to upload images' });
//                 }
//             }
//         }


//             const imgData = []
//             imgData.push(oldData.files)

//             // requseting all the data from the body
//             const {
//                 ProductName, BrandName, CategoryName, StockQuantity, subCategory,
//                 PurchaseRate, SalesRate, TotalPrice, ColorNames,
//                 ProductDescription, VATAmount, DiscountPrecentage, sizes
//             } = req.body

//             // Prepare sizes array
//             let ProductSize = sizes.map((size, index) => ({
//                 size,
//                 quantity: req.body.SizeQuantity[index]
//             }));
//             //assigning all the reqested data to product variable

//             if(Array.isArray(finalImage) && finalImage.length > 0){
//                 const Products = {
//                     ProductName,
//                     BrandName,
//                     CategoryName,
//                     StockQuantity,
//                     subCategory,
//                     PurchaseRate,
//                     SalesRate,
//                     TotalPrice,
//                     ColorNames,
//                     ProductDescription,
//                     VATAmount,
//                     DiscountPrecentage,
//                     ProductSize,
//                     files: Array.isArray(finalImage) && finalImage.length > 0 ? finalImage : oldData.files
//                 };
//             }



//             try {
//                 await ProductModel.findOneAndUpdate({ _id: req.query.id }, { $set: Products }).then((result) => {
//                     console.log('result :', result);
//                 }).catch(error => {
//                     console.log(error);
//                 });
//                 const subCategory = await subCategorySchema.distinct('subCategory');
//                 const productInfo = await ProductModel.findById(req.query.id)
//                 res.render('admin/editProducts', { subCategory, productInfo, success: 'Product Successfully Edited' })

//             } catch (saveError) {
//                 console.error('Error saving product to database:', saveError)
//                 res.status(500).json({ error: 'Failed to save product to database' })
//             }


//     } catch (error) {
//         console.log('Admin controller error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

// const postEditProduct = async (req, res) => {
//     try {
//         const oldProduct = await ProductModel.findById(req.query.id);

//         const uploader = async (path) => await cloudinary.uploads(path, 'Images');
//         const urls = [];
//         const files = req.files;

//         if (files && files.length > 0) {
//             for (const file of files) {
//                 const { path } = file;
//                 try {
//                     const newPath = await uploader(path);
//                     urls.push(newPath);
//                     fs.unlinkSync(path);
//                 } catch (uploadError) {
//                     console.error('Error uploading file to Cloudinary:', uploadError);
//                     return res.status(500).json({ error: 'Failed to upload images' });
//                 }
//             }
//         }

//         const imageUrls = urls.map(item => item.url).slice(0, 4);

//         const {
//             ProductName, BrandName, CategoryName, StockQuantity, subCategory,
//             PurchaseRate, SalesRate, TotalPrice, ColorNames,
//             ProductDescription, VATAmount, DiscountPrecentage, sizes
//         } = req.body;

//         const ProductSize = sizes.map((size, index) => ({
//             size,
//             quantity: req.body.SizeQuantity[index]
//         }));
//         const updatedProduct = {
//             ProductName, BrandName, CategoryName, StockQuantity, subCategory,
//             PurchaseRate, SalesRate, TotalPrice, ColorNames, ProductDescription,
//             VATAmount, DiscountPrecentage, ProductSize,
//             files: imageUrls.length > 0 ? imageUrls : oldProduct.files
//         };
//         try {

//             const updatedProductInfo = await ProductModel.findByIdAndUpdate(req.query.id, updatedProduct, { new: true });

//             const subCategory = await subCategorySchema.distinct('subCategory');

//             res.render('admin/editProducts', { subCategory, productInfo: updatedProductInfo, success: 'Product Successfully Edited' });
//         } catch (error) {
//             console.log(error)
//         }



//     } catch (error) {
//         console.error('Error editing product:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };






//Post method for editProducts page
// const postEditProduct = async (req, res) => {
//     try {

//         const oldData = await productModel.findById(req.query.id)
//         //Uploading image to Clouddinary
//         const uploader = async (path) => await cloudinary.uploads(path, 'Images')
//         const urls = []
//         const files = req.files
//         console.log(files)

//             if (req.files || req.files.length > 0) {
//                 for (const file of files) {
//                     const { path } = file
//                     try {
//                         const newPath = await uploader(path)
//                         urls.push(newPath)
//                         fs.unlinkSync(path)
//                     } catch (uploadError) {
//                         console.error('Error uploading file to Cloudinary:', uploadError)
//                         return res.status(500).json({ error: 'Failed to upload images' })
//                     }
//                 }
//             }



//     } catch (error) {
//         console.log('Admin controller error:', error)
//         res.status(500).json({ error: 'Internal Server Error' })
//     }
// }
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
    const Inventory = req.query.ID
    console.log('id : ', req.query.ID)
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

        const isExist = await subCategorySchema.findOne({
            CategoryName,
            subCategory
        })
        //assigning reqested data to the category variable
        const category = {
            CategoryName,
            subCategory,
            image: finalImage.length > 0 ? urls : oldData.image
        }
        //save the updated data to the database
        try {

            if (!isExist) {
                console.log(category);
                await subCategorySchema.findOneAndUpdate({ _id: req.params.id }, { $set: category }).then((result) => {
                    console.log('result :', result);
                }).catch(error => {
                    console.log(error);
                });
                const categoryData = await subCategorySchema.findById(req.params.id)
                res.render('admin/editCategory', { success: 'Category Edit Successfully', categoryData })
            } else {
                const categoryData = await subCategorySchema.findById(req.params.id)
                console.log(categoryData)
                res.render('admin/editCategory', { categoryData, success: 'Category Already Exist' })
            }

        } catch (saveError) {
            console.error('Error saving product to database:', saveError)
            res.status(500).json({ error: 'Failed to save product to database' })
        }
    } catch (error) {
        console.log('Admin controller error:', error)

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

            const isExist = await subCategorySchema.findOne({
                CategoryName,
                subCategory
            })

            console.log(isExist)
            const Category = {
                CategoryName,
                subCategory,
                image: urls
            }
            //add data to the database
            try {
                console.log(Category);
                if (!isExist) {
                    await subCategorySchema.create(Category);
                    res.render('admin/addCategory', { success: 'Category Added Successfully' })
                } else {
                    res.render('admin/addCategory', { success: 'Category Already Exist' })
                }


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
    if (req.query.delete === "Products") {
        if (req.query.id) {
            console.log('imag wsnhjfn ')
            await productModel.findByIdAndDelete(req.query.id)
            const productDetails = await productModel.find({})
            res.render('admin/ProductList', { productDetails, message: 'Product Successfully Deleted' })
        }
    }
    else if (req.query.delete === "Category") {
        if (req.query.id) {
            console.log('imag wsnhjfn ')
            await subCategorySchema.findByIdAndDelete({ _id: req.query.id })
            res.redirect('/adminLogin/Category')
        }
    }
}

const coupon = async (req, res) => {
    const coupons = await couponSchema.find({})
    res.render('admin/Coupon', { coupons })
}

function generateSimpleUniqueId() {
    const uniqueId = crypto.randomBytes(16).toString('base64'); // Generate a random unique ID
    return uniqueId;
}




const couponTasks = async (req, res) => {
    try {
        if (req.query.task == 'generateCode') {
            const uniqueId = generateSimpleUniqueId(); // Generate a new unique ID
            console.log('Generated unique ID:', uniqueId);
            res.json({ message: uniqueId }); // Sending JSON object with the generated unique ID
        } else if (req.query.task == 'addCoupon') {

            try {
                const data = {
                    couponCode: req.body.code,
                    Expire: req.body.expireOn,
                    discountAmount: req.body.discountAmt,
                    startDate: req.body.start,
                    minimumPurchase: req.body.min,
                    maxAmount: req.body.max,
                    title: req.body.title
                }

                await couponSchema.create(data)
            } catch (error) {
                console.log(error)
            }

        } else if (req.query.task == 'changeStatus') {
            try {
                if (req.body.currStatus === 'Listed') {
                    await couponSchema.findByIdAndUpdate(req.body.id, { $set: { status: 'Unlisted' } })
                } else if (req.body.currStatus === 'Unlisted') {
                    await couponSchema.findByIdAndUpdate(req.body.id, { $set: { status: 'Listed' } })
                }
            } catch (error) {
                console.log(error)
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' }); // Handle error response
    }
};

const deletCoupon = async (req, res) => {
    try {
        const id = req.body.id;
        await couponSchema.findByIdAndDelete(id)
    } catch (error) {
        console.log(error)
    }
}

const messageBox = async (req, res) => {
    const requestedData = await orderModel.find({
        $or: [
            { request: true },
            { Status: 'Order Cancelled' },
            { Status: 'Order Returned' },
            { rejected: true },
            { return: true }
        ]
    }).populate('userID').populate('productID');
    res.render('admin/messageBox', { requestedData })
}

const salesReport = async (req, res) => {
    if (req.query.filter === 'All') {
        const salesReport = await orderModel.find({ Status: 'Delivered' })
            .populate('productID')
            .populate('addressID')
        console.log(salesReport)
        res.render('admin/salesReport', { salesReport })
    } else if (req.query.filter === 'Daily') {
        // Get the current date
        const currentDate = new Date();

        // Extract the date part from currentDate
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        const salesReport = await orderModel.find({
            Status: 'Delivered', OrderDate: {
                $gte: currentDateOnly, // Greater than or equal to the current date
                $lt: new Date(currentDateOnly.getTime() + 86400000) // Less than the next day
            }
        }).sort({ OrderDate: 1 })
            .populate('productID')
            .populate('addressID')
        console.log(salesReport)
        res.render('admin/salesReport', { salesReport })
    } else if (req.query.filter === 'Monthly') {
        const currentMonth = new Date().getMonth() + 1; // Adding 1 because months are zero-indexed
        const currentYear = new Date().getFullYear();

        const salesReport = await orderModel.find({
            Status: 'Delivered',
            OrderDate: {
                $gte: new Date(currentYear, currentMonth - 1, 1), // Start of the current month
                $lt: new Date(currentYear, currentMonth, 0) // End of the current month
            }
        }).sort({ OrderDate: 1 })
            .populate('productID')
            .populate('addressID')
        console.log(salesReport)
        res.render('admin/salesReport', { salesReport })
    } else if (req.query.filter === 'Yearly') {
        // Get the current year
        const currentYear = new Date().getFullYear();

        const salesReport = await orderModel.find({
            Status: 'Delivered',
            OrderDate: {
                $gte: new Date(currentYear, 0, 1), // Start of the current year (January 1st)
                $lt: new Date(currentYear + 1, 0, 1) // Start of the next year (January 1st of the next year)
            }
        }).sort({ OrderDate: 1 })

            .populate('productID')
            .populate('addressID')
        console.log(salesReport)
        res.render('admin/salesReport', { salesReport })
    } else if (req.query.filter === 'customDate') {
        const startDate = req.query.startDate
        const endDate = req.query.endDate

        const salesReport = await orderModel.find({
            Status: 'Delivered',
            OrderDate: {
                $gte: new Date(startDate), // Start of the specified date range
                $lte: new Date(endDate) // End of the specified date range
            }
        }).sort({ OrderDate: 1 })
            .populate('productID')
            .populate('addressID')

        res.render('admin/salesReport', { salesReport })
    } else {
        const salesReport = await orderModel.find({ Status: 'Delivered' })
            .populate('productID')
            .populate('addressID')
        console.log(salesReport)
        res.render('admin/salesReport', { salesReport })
    }

}

const salesFilter = async (req, res) => {

}

const updateRequest = async (req, res) => {
    console.log('i ahem heree..')
    if (req.body.status === 'accept') {
        const data = await orderModel.findByIdAndUpdate(
            req.body.id,
            { $set: { Status: 'Order Cancelled', request: false, rejected: false } }
        );



        const product = await productModel.findById(data.productID._id)
        const productArray = [product];
        let returnData;
        let updatedProduct = productArray.map((val, index) => {
            return returnData = {
                ProductName: val.ProductName,
                BrandName: val.BrandName,
                CategoryName: val.CategoryName,
                StockQuantity: val.StockQuantity + val.quantity,
                subCategory: val.subCategory,
                PurchaseRate: val.PurchaseRate,
                SalesRate: val.SalesRate,
                TotalPrice: val.TotalPrice,
                ColorNames: val.ColorNames,
                ProductDescription: val.ProductDescription,
                VATAmount: val.VATAmount,
                MRP: val.MRP,
                ProductSize: [
                    {
                        size: val.ProductSize[0].size,
                        quantity: data.Size === val.ProductSize[0].size ? val.ProductSize[0].quantity + data.Quantity : val.ProductSize[0].quantity
                    },
                    {
                        size: val.ProductSize[1].size,
                        quantity: data.Size === val.ProductSize[1].size ? val.ProductSize[1].quantity + data.Quantity : val.ProductSize[1].quantity
                    },
                    {
                        size: val.ProductSize[2].size,
                        quantity: data.Size === val.ProductSize[2].size ? val.ProductSize[2].quantity + data.Quantity : val.ProductSize[2].quantity
                    },
                    {
                        size: val.ProductSize[3].size,
                        quantity: data.Size === val.ProductSize[3].size ? val.ProductSize[3].quantity + data.Quantity : val.ProductSize[3].quantity
                    },

                ],
                files: val.files,
                Inventory: val.Inventory,
                Added: val.Added,
                SI: val.SI

            }
        })

        // console.log('product',product)
        // console.log('updatedProduct',updatedProduct)

        const checkWallet = await walletSchema.findOne({ userID: data.userID }).sort({ added: -1 });

        const balance = checkWallet ? checkWallet.balance + data.Amount : data.Amount;

        const walletData = {
            userID: data.userID,
            productID: data.productID,
            orderID: req.body.id,
            balance: balance,
            transaction: 'Credit'
        }


        await productModel.findByIdAndUpdate(data.productID._id, updatedProduct[0], { new: true });

        // console.log('checkWallet',checkWallet)

        console.log('walletData', walletData)
        await walletSchema.create(walletData)


        res.redirect('admin/messageBox')

    } else if (req.body.status === 'reject') {
        await orderModel.findByIdAndUpdate(
            req.body.id,
            { $set: { rejected: true, request: false } }
        );
        res.redirect('admin/messageBox')
    } else if (req.body.status === 'returnAccepted') {
        const data = await orderModel.findByIdAndUpdate(
            req.body.id,
            { $set: { return: false, Status: 'Order Returned' } }
        );



        const product = await productModel.findById(data.productID._id)
        const productArray = [product];
        let returnData;
        let updatedProduct = productArray.map((val, index) => {
            return returnData = {
                ProductName: val.ProductName,
                BrandName: val.BrandName,
                CategoryName: val.CategoryName,
                StockQuantity: val.StockQuantity - val.quantity,
                subCategory: val.subCategory,
                PurchaseRate: val.PurchaseRate,
                SalesRate: val.SalesRate,
                TotalPrice: val.TotalPrice,
                ColorNames: val.ColorNames,
                ProductDescription: val.ProductDescription,
                VATAmount: val.VATAmount,
                MRP: val.MRP,
                ProductSize: [
                    {
                        size: val.ProductSize[0].size,
                        quantity: data.Size === val.ProductSize[0].size ? val.ProductSize[0].quantity + data.Quantity : val.ProductSize[0].quantity
                    },
                    {
                        size: val.ProductSize[1].size,
                        quantity: data.Size === val.ProductSize[1].size ? val.ProductSize[1].quantity + data.Quantity : val.ProductSize[1].quantity
                    },
                    {
                        size: val.ProductSize[2].size,
                        quantity: data.Size === val.ProductSize[2].size ? val.ProductSize[2].quantity + data.Quantity : val.ProductSize[2].quantity
                    },
                    {
                        size: val.ProductSize[3].size,
                        quantity: data.Size === val.ProductSize[3].size ? val.ProductSize[3].quantity + data.Quantity : val.ProductSize[3].quantity
                    },

                ],
                files: val.files,
                Inventory: val.Inventory,
                Added: val.Added,
                SI: val.SI

            }
        })

        // console.log('product',product)
        // console.log('updatedProduct',updatedProduct)
        const checkWallet = await walletSchema.findOne({ userID: data.userID }).sort({ added: -1 });

        const balance = checkWallet ? checkWallet.balance + data.Amount : data.Amount;

        const walletData = {
            userID: data.userID,
            productID: data.productID,
            orderID: req.body.id,
            balance: balance,
            transaction: 'Credit'
        }


        await productModel.findByIdAndUpdate(data.productID._id, updatedProduct[0], { new: true });


        // console.log('checkWallet',checkWallet)

        console.log('walletData', walletData)
        await walletSchema.create(walletData)


        res.redirect('admin/messageBox')
    } else if (req.body.status === 'returnRejected') {
        await orderModel.findByIdAndUpdate(
            req.body.id,
            { $set: { return: false, rejected: true } }
        );
    }

}
//Section for Post Method End here.....
//.................................................................................................................................................


module.exports = {
    adminLogin,
    updateRequest,
    adminLoginPost,
    productList,
    productListEdit,
    categoryPost,
    addProductsPost,
    deleteInventory,
    adminDashboard,
    CustomerDetails,
    filterCategory,
    updateUser,
    productSearch,
    Category,
    CustomerFilter,
    postAddCategory,
    categoryEdit,
    salesFilter,
    postEditProduct,
    logout,
    OrderTasks,
    orderHistory,
    messageBox,
    coupon,
    couponTasks,
    salesReport,
    offers,
    offerTasks,
    editOffer,
    DeleteOffer,
    deletCoupon

}