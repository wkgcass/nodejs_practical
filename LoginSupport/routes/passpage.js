var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    if (req.query.register == "") {
        res.render('register');
    } else if (req.query.activate == "") {
        res.render('activate');
    } else {
        res.render('login');
    }
});


module.exports = router;