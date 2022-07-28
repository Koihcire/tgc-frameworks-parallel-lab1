const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
var helpers = require('handlebars-helpers')({
    handlebars: hbs.handlebars
});

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

//import in routes
const landingRoutes = require('./routes/landing');
const posterRoutes = require('./routes/posters');
//app.use('/', require('./routes/landing')) short form

app.use('/', landingRoutes);
app.use('/posters', posterRoutes);

app.listen(3000, () => {
    console.log("server started")
})