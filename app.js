require('dotenv').config();
const express = require('express');
const ejs = require("ejs");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/User');
const helmet = require('helmet');

//MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to MongoDB via Mongoose"))
  .catch((err) => {
    console.log("Error", err);
});


const app = express();

//App Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js",
  "https://kit.fontawesome.com/c1f368b5b8.js",
  "https://cdnjs.cloudflare.com/ajax/libs/ckeditor/4.16.2/ckeditor.js",
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css",
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://fontawesome.com/",
  "https://fontawesome.com/v5.15/icons?d=gallery&p=2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
  "https://kit.fontawesome.com/c1f368b5b8.js",
  "https://fontawesome.com/start",
  "https://icons.getbootstrap.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: [],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: ["'self'", "blob:", "data:", "https://images.unsplash.com/"],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//Session Config
const secret = process.env.SECRET;
app.use(
  session({
    name: "ShareBlog",
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
        // secure: true
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, //(URI FROM.env file)
    }),
  })
);

//Passport Config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Locals
app.locals.stripTags = function (input) {
    return input.replace(/<(?:.|\n)*?>/gm, " ");
};
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//Routes
app.use("/", require("./routes/index"));
app.use("/articles", require("./routes/articles"));

//Connect
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening to port ${port}.`);
});