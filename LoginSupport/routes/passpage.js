var express = require('express');
var router = express.Router();
var controller = require("../modules/controller");
var relation = require("../modules/moduleRelation");
var config = require("../global/config");

router.get('/', function (req, res) {
    // fill email address
    var fill_emladdr = null;
    if (req.query.fill_emladdr == undefined) {
        fill_emladdr = "";
    } else {
        fill_emladdr = req.query.fill_emladdr;
    }
    // do routing
    if (req.query.register == "") {
        res.render('register', {"fill_emladdr": fill_emladdr});
    } else if (req.query.activate == "") {
        res.render('activate', {"fill_emladdr": fill_emladdr});
    } else if (req.query.lost_pwd == "") {
        res.render('forget', {"fill_emladdr": fill_emladdr});
    } else {
        res.render('login', {"fill_emladdr": fill_emladdr});
    }
});

router.get('/:token', function (req, res) {
    // prepare
    var token = req.params.token;

    var module_name = "user";
    var modObj = relation.getNamedModule(module_name);

    var check = controller.getNamedActionFunc("check_token", modObj.actions);

    check(req.ip, token, function (err, result) {
        if (err) {
            res.send("<script>alert('error:" + err + ", description:" + result + "');history.go(-1);</script>");
        } else {
            var options = {};
            options["items"] = JSON.parse(JSON.stringify(config.system.interfaces.imported));
            var flag = false;
            out:for (var key in req.query) {
                for (var cat in config.system.interfaces.imported) {
                    for (var i = 0; i < config.system.interfaces.imported[cat].length; ++i) {
                        if (key.toLowerCase() == config.system.interfaces.imported[cat][i].name.toLowerCase()) {
                            options["default_url"] = config.system.interfaces.imported[cat][i].target_url.replace("{$token}", token);
                            if (options.default_url.indexOf("?") < 0) {
                                options.default_url += "?";
                            }
                            // check item in cloned 'items'
                            options.items[cat][i].checked = true;
                            flag = true;
                            break out;
                        }
                    }
                }
            }
            for (var key2 in options.items) {
                for (var i = 0; i < options.items[key2].length; ++i) {
                    options.items[key2][i].target_url = options.items[key2][i].target_url.replace("{$token}", token);
                }
            }
            if (!flag) {
                options["default_url"] = token + "/p?checkCurrent";
            }
            options.user = result;
            res.render("user", options);
        }
    });
});

router.get('/:token/p', function (req, res) {
    // prepare
    var token = req.params.token;
    var module_name = "user";
    var modObj = relation.getNamedModule(module_name);

    function doErr() {
        res.send("<script>alert('error:" + err + ", description:" + result + "');history.go(-1);</script>");
    }

    if (req.query.checkCurrent == "") {
        var check = controller.getNamedActionFunc("check_token", modObj.actions);
        check(req.ip, token, function (err, result) {
            if (err) {
                doErr();
            } else {
                res.render("usersup/current", {"user": result});
            }
        });
    } else if (req.query.changePWD == "") {
        res.render("usersup/changepwd");
    } else if (req.query.checkTokens == "") {
        var showAll = controller.getNamedActionFunc("show_all_tokens", modObj.actions);
        showAll(req.ip, token, function (err, result) {
            if (err) {
                doErr();
            } else {
                res.render("usersup/tokens", {"tokens": result});
            }
        });
    } else {
        res.send("Command Not Found...");
    }
});


module.exports = router;