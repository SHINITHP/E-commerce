const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')

const userRouter = require("./routes/user/userRoutes")
const adminRoutes = require('./routes/admin/adminRoutes.js')

app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public"))); 
app.use(express.json())
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))  



app.use('/',userRouter);
app.use('/adminLogin',adminRoutes)

app.get('/',(req,res) =>{
    res.render('user/profile')
})



const port = process.env.port||8000
app.listen(port,(err)=>{
    if(err) console.log(err);
    console.log(`Server running successfully on the port ${port}`); 
})