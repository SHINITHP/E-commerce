const jwt = require('jsonwebtoken')
require('dotenv').config()

const userAuth = async (req, res, next) => {
    // console.log('jwt token : ', req.cookies.jwtUser, '233wjn3iuui3232  f ', process.env.JWT_SECRET);
    const token = req.cookies.jwtUser;

    if (token) {
        try {

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    res.render('user/login', { error: " " })
                }
                    // console.log('decoded data means :',decoded);
                    // req.decoded = decoded
                    next()
            })

        } catch (error) {
            res.render('user/login', { error: "Error while Login" })
        }
    } else {
        res.redirect('/login')
        // res.render('user/login', { error: "Error while Login" })
    }

}


module.exports = {
    userAuth
}