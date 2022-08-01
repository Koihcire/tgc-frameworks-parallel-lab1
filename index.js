const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const helpers = require('handlebars-helpers')({
    handlebars: hbs.handlebars
});
const session = require ('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

//create an instance of app
let app = express();
//set view engine
app.set("view engine", "hbs");
//static folder
app.use(express.static("public"));
//set up wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");
//enable forms
app.use(
    express.urlencoded({
        extended: false
    })
)

//set up sessions
app.use(session({
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

//set up flash messages
app.use(flash());
//register flash middleware
app.use(function(req,res,next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
});

//import in routes
const landingRoutes = require('./routes/landing');
const posterRoutes = require('./routes/posters');
const userRoutes = require('./routes/users');
//app.use('/', require('./routes/landing')) short form



app.use('/', landingRoutes);
app.use('/posters', posterRoutes);
app.use('/users', userRoutes)

app.listen(3000, () => {
    console.log("server started")
})