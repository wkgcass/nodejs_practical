var express = require('express');
var router = express.Router();
var controller = require("../modules/controller");
var relation = require("../modules/moduleRelation");
var config = require("../global/config");
var language = require("../global/language");

// prepare
var module_name = "user";
var modObj = relation.getNamedModule(module_name);

var check = controller.getNamedActionFunc("check_token", modObj.actions);

function doErr(res, err, result) {
    res.send("<script>alert('error:" + err + ", description:" + result + "');window.location.href='../passport';</script>");
}

router.get('/', function (req, res) {
    // check phone
    var is_phone = true;
    if (/mobile/i.test(req.headers['user-agent']))
        is_phone = true;
    else
        is_phone = false;
    // respond cookie check
    if (req.query['cookieCheck'] != undefined) {
        if (req.cookies.token != null && req.cookies.token != "") {
            if (req.query.callback == undefined) {
                res.send({
                    "state": "success",
                    "res": req.cookies.token
                });
            } else {
                res.send(req.query.callback + "(" + JSON.stringify({
                    "state": "success",
                    "res": req.cookies.token
                }) + ")");
            }
        } else {
            if (req.query.callback == undefined) {
                res.send({
                    "state": "error",
                    "err": "404",
                    "res": "cookie with token not found"
                });
            } else {
                res.send(req.query.callback + "(" + JSON.stringify({
                    "state": "error",
                    "err": "404",
                    "res": "cookie with token not found"
                }) + ")");
            }
        }
        return;
    }

    var lan = req.query.lan;
    if (lan == undefined) {
        lan = language.default_lan;
    }
    var acceptlan = req.header("Accept-Language");
    if (acceptlan.toLowerCase().indexOf("zh-cn") >= 0) {
        lan = "cn";
    } else if (acceptlan.toLowerCase().indexOf("en") >= 0) {
        lan = "en";
    }
    // fill email address
    var fill_emladdr = null;
    if (req.query.fill_emladdr == undefined) {
        fill_emladdr = "";
    } else {
        fill_emladdr = req.query.fill_emladdr;
    }
    // do routing
    if (req.query.register == "") {
        res.render('register', {"fill_emladdr": fill_emladdr, "title": "Register", "lan": language.lan[lan], "is_phone": is_phone});
    } else if (req.query.activate == "") {
        res.render('activate', {"fill_emladdr": fill_emladdr, "title": "Activate", "lan": language.lan[lan], "is_phone": is_phone});
    } else if (req.query.lost_pwd == "") {
        res.render('forget', {"fill_emladdr": fill_emladdr, "title": "Forget Password", "lan": language.lan[lan], "is_phone": is_phone});
    } else {
        // login
        if (req.cookies.token != undefined && req.cookies.token != "" && (req.cookies.is_tmp == undefined || req.cookies.is_tmp != "true")) {
            var token = req.cookies.token;
            check(req.ip, token, function (err, result) {
                if (err || result.deprecated) {
                    res.render('login', {"fill_emladdr": fill_emladdr, "title": "Login", "lan": language.lan[lan], "is_phone": is_phone});
                } else {
                    res.redirect(req.cookies.token);
                }
            });
        } else {
            res.render('login', {"fill_emladdr": fill_emladdr, "title": "Login", "lan": language.lan[lan], "is_phone": is_phone});
        }
    }
});

router.get('/:token', function (req, res) {
    // check phone
    var is_phone = true;
    if (/mobile/i.test(req.headers['user-agent']))
        is_phone = true;
    else
        is_phone = false;
    var lan = req.query.lan;
    if (lan == undefined) {
        lan = language.default_lan;
    }
    var acceptlan = req.header("Accept-Language");
    if (acceptlan.toLowerCase().indexOf("zh-cn") >= 0) {
        lan = "cn";
    } else if (acceptlan.toLowerCase().indexOf("en") >= 0) {
        lan = "en";
    }
    var token = req.params.token;
    var show_remvoe_cookie = false;
    if (req.cookies.token != undefined && req.cookies.token != "") {
        show_remvoe_cookie = true;
    }
    check(req.ip, token, function (err, result) {
        if (err) {
            doErr(res, err, result);
        } else {
            if (result.deprecated) {
                doErr(res, 102, "token is deprecated");
                return;
            }
            var options = {"title": "My Account", "lan": language.lan[lan], "lan_mapping": language.mapping[lan], "is_phone": is_phone};
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
            options.show_remvoe_cookie = show_remvoe_cookie;
            res.render("user", options);
        }
    });
});

router.get('/:token/p', function (req, res) {
    var lan = req.query.lan;
    if (lan == undefined) {
        lan = language.default_lan;
    }
    var acceptlan = req.header("Accept-Language");
    if (acceptlan.toLowerCase().indexOf("zh-cn") >= 0) {
        lan = "cn";
    } else if (acceptlan.toLowerCase().indexOf("en") >= 0) {
        lan = "en";
    }
    // prepare
    var token = req.params.token;
    var module_name = "user";
    var modObj = relation.getNamedModule(module_name);

    if (req.query.checkCurrent == "") {
        var check = controller.getNamedActionFunc("check_token", modObj.actions);
        check(req.ip, token, function (err, result) {
            if (err) {
                doErr(res, err, result);
            } else {
                res.render("usersup/current", {"user": result, "lan": language.lan[lan]});
            }
        });
    } else if (req.query.changePWD == "") {
        res.render("usersup/changepwd", {"lan": language.lan[lan]});
    } else if (req.query.checkTokens == "") {
        var showAll = controller.getNamedActionFunc("show_all_tokens", modObj.actions);
        showAll(req.ip, token, function (err, result) {
            if (err) {
                doErr(res, err, result);
            } else {
                res.render("usersup/tokens", {"tokens": result, "lan": language.lan[lan]});
            }
        });
    } else {
        res.send("Command Not Found...");
    }
});


module.exports = router;