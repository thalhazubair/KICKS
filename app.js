const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser')
const session = require('express-session')
// const path = require('path')
const adminRouter = require("./routes/admin")
const userRouter = require("./routes/user")
const fileupload = require('express-fileupload')


dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(()=>console.log("connection success"));

app.use(session({
    secret:'thisismykey',
    saveUninitialized:true,
    cookie:{maxAge:600000},
    resave:true
}))

app.use((req, res, next) => {
    res.set(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next()
})

app.use(cookieParser())

app.use(express.urlencoded({
    extended: false
 }));
 
 app.use(express.json());

app.set('view engine', 'ejs')
app.set('views','./views')

app.use(express.static("public"))
// app.use("css",express.static(path.join(__dirname + "public/css")))
app.use(fileupload())

app.use('/admin',adminRouter)
app.use('/',userRouter)

app.listen(process.env.PORT || 3000,()=>{
    console.log("listening to 3000")
})

