const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const validateArticle = require('../validateArticle');
const {checkAuth} = require('../middleware/auth');

//@Description      All Articles
//@Route            GET /articles
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find({}).sort({ createdOn: "desc" }).populate('user');
    res.render("home", { page: "Home", articles });
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

//@Description      Render New Article Page
//@Route            GET /articles/new
router.get("/new", checkAuth, (req, res) => {
  res.render("new", { page: "New" });
});

//@Description      Create New Article
//@Route            POST /articles/new
router.post("/", checkAuth, validateArticle, async (req, res) => {
  try {
    const newArticle = new Article(req.body.article);
    newArticle.user = req.user._id;
    await newArticle.save();
    req.flash('success', 'Successfully added a new article!')
    res.redirect("/articles");
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

//@Description      Show An Article
//@Route            GET /article/:slug
router.get("/:slug", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).populate('user');

    if (!article) {
      res.render("error/404");
    } else {
      res.render("show", { page: "Info", article, name: article.user.username });
    }
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

//@Description      Edit An Article
//@Route            GET /article/:slug/edit
router.get("/:slug/edit", checkAuth, async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).populate('user');

    if(article.user._id != req.user.id) {
      req.flash('error', 'You are not the author of this article.')
      res.redirect(`/articles/${article.slug}`)
    } else {
    res.render("edit", { page: "Edit", article });
    }
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

//@Description      Edit An Article
//@Route            PUT /article/:id/
router.put("/:id", checkAuth, validateArticle, async (req, res) => {
  try {
    const {id} = req.params;
    const article = await Article.findById(id);
    if(article.user._id != req.user.id) {
      req.flash('error', 'You are not the author of this article.')
      res.redirect(`/articles/${article.slug}`)
    } else {
    const { id } = req.params;
    const foundArticle = await Article.findByIdAndUpdate(id, {
      ...req.body.article,
    })
  }
    res.redirect("/articles");
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

//@Description      Delete An Article
//@Route            DELETE /article/:id
router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id)
    if(article.user._id != req.user.id) {
      req.flash('error', 'You are not the author of this article.')
      res.redirect(`/articles/${article.slug}`)
    } else {
    const deleted = await Article.findByIdAndDelete(id);
    res.redirect("/articles");
    }
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

// @description   Show Page For User
// @route         GET /articles/userId
router.get('/user/:id', async(req, res) => {
  try {
    const {id} = req.params
    const foundArticle = await Article.findOne({user: id, status: 'public'}).populate('user')
    const articles = await Article.find({user: id}).populate('user')
    res.render('user', {articles, foundArticle, page: 'User'})
  } catch (error) {
    console.error(error)
    res.render('error/500')
  }
    
})


module.exports = router;
