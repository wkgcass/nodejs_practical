var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render("index", {
        "title": "Cass的个人主页"
    });
});

module.exports = router;
