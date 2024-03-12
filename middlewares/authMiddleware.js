const jwt = require('jsonwebtoken')

const userAuth = (req, res, next) => {
    const token = req.cookies.jwtUser;
    if(!token){
        res.render('user/login',{error: ""})
    }else{
        res.redirect('/Profile')
    }

    // //verify the token is correct and redirect to home
    // jwt.verify(token,'jwt_SecretKey', (err,decoded) => {
    //     if(err){
    //         res.render('user/login',{error:" "})
    //     }
    //     req.decoded = decoded
    //     // res.redirect('/');
    //     next()
    // })
}


module.exports = {
    userAuth
}