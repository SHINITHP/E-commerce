const jwt = require('jsonwebtoken')

const adminAuth = (req, res, next) => {
    const token = req.cookies.jwtAdmin;
    // console.log('00000000000000',token)
    if(!token){
        res.render('admin/adminLogin',{message: ""})
    }else{

  

    //verify the token is correct and redirect to home
    jwt.verify(token,'jwt_adminSecretKey', (err,decoded) => {
        if(err){
            res.render('admin/adminLogin',{message:" "})
        }
            req.decoded = decoded
            res.redirect('/adminLogin/adminDashboard')
    }) 
 }
}

module.exports = adminAuth;