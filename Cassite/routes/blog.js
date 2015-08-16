var express = require('express');
var router = express.Router();
var buffer = require("../modules/buffer");
var config = require("../modules/config");

/* GET users listing. */
router.get('/', function (req, res) {
    res.render("blog_index", {
        "cats": buffer.getCats(),
        "current": null,
        "title": "Blog",
        "preview": buffer.getAll(0, config.default_latest_count)
    });
});

router.get('/out', function (req, res) {
    res.render("blog_out", {
        "cats": buffer.getCats(),
        "current": null,
        "title": "Blog",
        "preview": buffer.getAll(0, config.preview_for_out)
    });
});

router.get('/:cat', function (req, res, next) {
    var cat = req.params.cat;
    var blogs = buffer.getByCat(cat, 0, config.default_latest_count);
    if (blogs == undefined) {
        next();
    }
    res.render("blog_cat", {
        "cats": buffer.getCats(),
        "current": cat,
        "title": cat,
        "preview": blogs
    });
});

router.get('/:cat/:blog', function (req, res, next) {
    var cat = req.params.cat;
    var blog = req.params.blog;
    var blogDetail = buffer.getOne(cat, blog);
    if (blogDetail == undefined) {
        next();
    }
    res.render("blog_detail", {
        "cats": buffer.getCats(),
        "current": cat,
        "title": blogDetail.title,
        "detail": blogDetail
    });
});

module.exports = router;
