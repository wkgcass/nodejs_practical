var express = require('express');
var router = express.Router();
var controller = require("../modules/controller");
var relation = require("../modules/moduleRelation");
var config = require("../global/config");

router.get('/', function (req, res) {
    var req_ip = req.ip;
    for (var i = 0; i < config.system.direct_ip.length; ++i) {
        if (config.system.direct_ip[i] == req.ip) {
            req_ip = req.query.ip == undefined ? req_ip : req.query.ip;
            break;
        }
    }

    var module_name = "passport";
    var modObj = relation.getNamedModule(module_name);
    var act = controller.getActionAndArgs(req, modObj.actions);

    res.setHeader("Content-Type", "text/json");

    var doDefault = function () {
        var avaActions = controller.getAvailableActions(modObj);
        var avaChildren = controller.getAvailableChildren(module_name);
        res.send(controller.appendGuide({
            "global_exceptions": require("../modules/exceptions")
        }, avaActions, avaChildren));
    };
    var doPrint = function (err, result) {
        controller.handleResult(err, result, function (obj) {
            if (req.query.callback != undefined && req.query.callback != "") {
                res.send(req.query.callback + "(" + JSON.stringify(obj, null, 4) + ");");
            } else {
                res.send(JSON.stringify(obj, null, 4));
            }
        });
    };

    if (act == null) {
        doDefault();
    } else if (act.action == "login") {
        act.func(req_ip, act.args.emladdr, act.args.pwd, doPrint);
    } else if (act.action == "register") {
        act.func(act.args.emladdr, act.args.pwd, doPrint);
    } else if (act.action == "activate") {
        act.func(act.args.emladdr, act.args.code, doPrint);
    } else if (act.action == "lostPWD") {
        act.func(req_ip, act.args.emladdr, doPrint);
    } else if (act.action == "resend") {
        act.func(act.args.emladdr, doPrint);
    } else if (act.action == "getPublicKey") {
        act.func(doPrint);
    } else if (act.action == "getEmladdrById") {
        act.func(JSON.parse(act.args.user_ids).arr, doPrint);
    } else {
        doDefault();
    }
});

router.get('/:token', function (req, res) {
    var req_ip = req.ip;
    for (var i = 0; i < config.system.direct_ip.length; ++i) {
        if (config.system.direct_ip[i] == req.ip) {
            req_ip = req.query.ip == undefined ? req_ip : req.query.ip;
            break;
        }
    }

    var token = req.params.token;

    var module_name = "user";
    var modObj = relation.getNamedModule(module_name);
    var act = controller.getActionAndArgs(req, modObj.actions);

    res.setHeader("Content-Type", "text/json");

    var doDefault = function () {
        var check = controller.getNamedActionFunc("check_token", modObj.actions);
        check(req.ip, token, function (err, result) {
            controller.handleResult(err, result, function (obj) {
                var avaActions = controller.getAvailableActions(modObj);
                var avaChildren = controller.getAvailableChildren(module_name);
                res.send(controller.appendGuide(obj, avaActions, avaChildren));
            });
        });
    };
    var doPrint = function (err, result) {
        controller.handleResult(err, result, function (obj) {
            if (req.query.callback != undefined && req.query.callback != "") {
                res.send(req.query.callback + "(" + JSON.stringify(obj, null, 4) + ");");
            } else {
                res.send(JSON.stringify(obj, null, 4));
            }
        });
    };

    if (act == null) {
        doDefault();
    } else {
        if (act.action == "check") {
            act.func(req_ip, token, doPrint, act.args.refresh);
        } else if (act.action == "logout") {
            act.func(req_ip, token, doPrint);
        } else if (act.action == "logoutAll") {
            act.func(req_ip, token, doPrint);
        } else if (act.action == "changePWD") {
            act.func(req_ip, token, act.args.opwd, act.args.npwd, doPrint);
        } else if (act.action == "allTokens") {
            act.func(req_ip, token, doPrint);
        } else {
            doDefault();
        }
    }
});

module.exports = router;