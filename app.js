const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session');
const passportSetup = require('./controller/googleOuath.js')
require('dotenv').config()

const userRouter = require("./routes/user/userRoutes")
const adminRoutes = require('./routes/admin/adminRoutes.js')

app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public"))); 
app.use(express.json())
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use(session({
    secret:process.env.COOKIES_KEY,
    resave: false,
    saveUninitialized: false
  }));

//passport
app.use(passport.initialize());
app.use(passport.session());

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))  

// app.use('/',userRouter);
// app.use('/adminLogin',adminRoutes)

app.get('/', (req,res) => {
  res.render('user/manageAddress')
})
const port = process.env.port||8000
app.listen(port,(err)=>{
    if(err) console.log(err);
    console.log(`Server running successfully on the port ${port}`); 
})