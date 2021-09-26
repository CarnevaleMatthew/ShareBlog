const express = require("express");
const passport = require("passport");
const { transformAuthInfo } = require("passport");
const router = express.Router();
const User = require("../models/User");
const Article = require('../models/Article')
const {checkAuth} = require('../middleware/auth')

// @description   Home Page
// @route         GET /home
router.get('/mypage', checkAuth, async(req, res) => {
  try {
  const articles = await Article.find({user: req.user.id})
  res.render('mypage', {page: 'My Page', articles,
      name: req.user.username})
  } catch (error) {
      console.error(error)
      res.render("error/500");
  }
})

//@Description      Register Page
//@Route            GET /register
router.get("/register", (req, res) => {
  res.render("register", { page: "Register" });
});

//@Description      Register New User
//@Route            POST /register
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const newUser = await User.register(user, password);
    console.log(newUser);
    req.flash(
      "success",
      "Welcome to ShareBlog. You may now submit new articles!"
    );
    res.redirect("/articles");
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/register');
  }
});

//@Description      Login Page
//@Route            GET /login
router.get("/login", (req, res) => {
    res.render("login", { page: "Login" });
});

//@Description      Login 
//@Route            POST /login
router.post("/login", passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
  req.flash('success', `Welcome back, ${req.user.username}!`)
  res.redirect('/articles');
});

// @description   Logout User
// @route         GET /logout
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success', 'Successfully logged out. Please come back again.')
  res.redirect('/articles')
})


module.exports = router;
