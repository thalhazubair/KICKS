const express = require("express");
const app = express();
const mongoose = require("mongoose");

const dotenv = require("dotenv");
const cookieParser = require('cookie-parser')
const session = require('express-session')
const adminRouter = require("./routes/admin")
const userRouter = require("./routes/user")
const fileupload = require('express-fileupload')
const methodOverride = require('method-override')


dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(()=>console.log("connection success"));

app.use(session({
    secret:'thisismykey',
    saveUninitialized:true,
    cookie:{maxAge:600000},
    resave:true
}))

app.use(methodOverride("_method"));

app.use((req, res, next) => {
    res.set(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next()
})

app.use(cookieParser())

app.use(express.urlencoded({
    extended: true
 }));
 
 app.use(express.json());

app.set('view engine', 'ejs')
app.set('views','./views')

app.use(express.static("public"))
app.use(fileupload())



app.use('/admin',adminRouter)
app.use('/',userRouter)

app.use((req,res)=>{
    res.status(404).render('user/404')
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next)=>{
    console.error(err.stack)
    res.status(500).render('user/500')
})

app.listen(process.env.PORT || 3000,()=>{
    console.log("listening to 3000")
})

