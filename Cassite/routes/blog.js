var express = require('express');
var router = express.Router();
var buffer = require("../modules/buffer");

/* GET users listing. */
router.get('/', function (req, res) {
    res.render("blog_index");
});

router.get('/:blog', function (req, res) {
    res.render("blog_detail");
});

module.exports = router;
