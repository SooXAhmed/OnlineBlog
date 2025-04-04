require("dotenv").config();
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const { isActiveRoute } = require("./server/helpers/routeHelpers");
const flash = require("connect-flash");
//this  middlewares is to be able to encode text in input fields
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//this middleware is used when using the put method to updata an existing data in the db
app.use(methodOverride("_method"));

//this middlewares is for  grapping the cookies  that will be containg info about the session so that we stay logged in
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MongoURI,
    }),
  })
);
app.use(flash());

// configureing the database
const connectdb = require("./server/config/db");
//connect to db
connectdb();
console.log("connected to db")
app.use(express.static("public"));
app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
// body parser for handling the body of the request which is the input of the form
app.use(express.urlencoded({ extended: false }));

app.locals.isActiveRoute = isActiveRoute;

// routes
app.use("/",require("./server/routes/main"));
app.use("/",require("./server/routes/user"));

app.listen(5000, () => {
  console.log("the server is running");
});
