var express = require('express');
var router = express.Router();
var controller = require("../modules/controller");
var relation = require("../modules/moduleRelation");

var doPrint = function (err, result) {
    controller.handleResult(err, result, function (obj) {
        res.send(JSON.stringify(obj, null, 4));
    });
};

router.get('/', function (req, res) {
    var module_name = "passport";
    var modObj = relation.getNamedModule(module_name);
    var act = controller.getActionAndArgs(req, modObj.actions);

    res.setHeader("Content-Type", "application/json");

    var doDefault = function () {
        var avaActions = controller.getAvailableActions(modObj);
        var avaChildren = controller.getAvailableChildren(module_name);
        res.send(controller.appendGuide({
            "info": "RSA public key can download from '../keys/public_key.pem'",
            "global_exceptions": require("../modules/exceptions")
        }, avaActions, avaChildren));
    };

    if (act == null) {
        doDefault();
    } else if (act.action == "login") {
        act.func(req.ip, act.args.emladdr, act.args.pwd, doPrint);
    } else if (act.action == "register") {
        act.func(act.args.emladdr, act.args.pwd, doPrint);
    } else if (act.action == "activate") {
        act.func(act.args.emladdr, act.args.code, doPrint);
    } else if (act.action == "lostPWD") {
        act.func(req.ip, act.args.emladdr, doPrint);
    } else if (act.action == "resend") {
        act.func(act.args.emladdr, doPrint);
    } else {
        doDefault();
    }
});

router.get('/:token', function (req, res) {
    var token = req.params.token;

    var module_name = "user";
    var modObj = relation.getNamedModule(module_name);
    var act = controller.getActionAndArgs(req, modObj.actions);

    res.setHeader("Content-Type", "application/json");

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

    if (act == null) {
        doDefault();
    } else {
        if (act.action == "check") {
            act.func(req.ip, token, doPrint);
        } else if (act.action == "logout") {
            act.func(req.ip, token, doPrint);
        } else if (act.action == "logoutAll") {
            act.func(req.ip, token, doPrint);
        } else if (act.action == "changePWD") {
            act.func(req.ip, token, act.args.opwd, act.args.npwd, doPrint);
        } else {
            doDefault();
        }
    }
});

module.exports = router;