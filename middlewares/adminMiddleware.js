const jwt = require('jsonwebtoken')
require('dotenv').config()

const adminAuth = (req, res, next) => {
    const token = req.cookies.jwtAdmin;

    if (token) {
        try {

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    res.render('admin/adminLogin', { message: " " })
                }
                // console.log('decoded data means :',decoded);
                req.decoded = decoded
                res.redirect('/adminLogin/adminDashboard')
            })

        } catch (error) {
            res.render('admin/adminLogin', { message: "Error while Login" })
        }
    } else {
        res.render('admin/adminLogin', { message: " " })
    }

}

module.exports = adminAuth;