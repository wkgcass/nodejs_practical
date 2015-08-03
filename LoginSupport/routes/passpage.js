var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    if (req.query.register == "") {
        res.render('register');
    } else if (req.query.activate == "") {
        res.render('activate');
    } else if (req.query.lost_pwd == "") {
        res.render('forget');
    } else {
        res.render('login');
    }
});


module.exports = router;