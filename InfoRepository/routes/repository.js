var express = require('express');
var router = express.Router();
var controller = require("../modules/controller");
var relation = require("../modules/moduleRelation");

router.get('/', function (req, res) {
    var module_name = "root";

    res.setHeader("Content-Type", "text/json");

    var doDefault = function () {
        var avaChildren = controller.getAvailableChildren(module_name);
        res.send(controller.appendGuide({
            "global_exceptions": require("../modules/exceptions")
        }, [], avaChildren));
    };

    doDefault();
});

router.get('/:token', function (req, res, next) {
    res.setHeader("Content-Type", "text/json");
    if (req.params.token == "rep" || req.params.token == "records" || req.params.token == "groups") {
        next();
        return;
    }

    var doDefault = function () {
        var avaActions = controller.getAvailableActions(modObj);
        var avaChildren = controller.getAvailableChildren(module_name);
        res.send(controller.appendGuide({}, avaActions, avaChildren));
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

    var token = req.params.token;
    var module_name = "me";
    var modObj = relation.getNamedModule(module_name);
    var act = controller.getActionAndArgs(req, modObj.actions);

    if (act == null) {
        doDefault();
    } else if (act.action == "show") {
        act.func(req.ip, token, doPrint);
    } else if (act.action == "groups") {
        act.func(req.ip, token, doPrint);
    } else if (act.action == "create") {
        act.func(req.ip, token, act.args.name, act.args.encrypt, act.args.is_group == "true", doPrint, act.args.struct == undefined ? undefined : JSON.parse(act.args.struct));
    } else if (act.action == "createGroup") {
        act.func(req.ip, token, act.args.name, doPrint);
    } else {
        doDefault();
    }
});

router.get("/rep/:rep_id", function (req, res) {
    res.setHeader("Content-Type", "text/json");

    var doDefault = function () {
        var avaActions = controller.getAvailableActions(modObj);
        var avaChildren = controller.getAvailableChildren(module_name);
        res.send(controller.appendGuide({}, avaActions, avaChildren));
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

    var rep_id = req.params.rep_id;
    var token = req.query.token;
    var module_name = "repository";
    var modObj = relation.getNamedModule(module_name);
    var act = controller.getActionAndArgs(req, modObj.actions);

    if (act == null) {
        doDefault();
    } else if (act.action == "drop") {
        act.func(req.ip, token, rep_id, doPrint);
    } else if (act.action == "add") {
        act.func(req.ip, token, rep_id, JSON.parse(act.args.record), doPrint);
    } else if (act.action == "show") {
        act.func(req.ip, token, rep_id, doPrint);
    } else if (act.action == "permission") {
        act.func(req.ip, token, rep_id, doPrint);
    } else if (act.action == "setPermission") {
        act.func(req.ip, token, rep_id, act.args.id, act.args.is_group == "true", doPrint, act.args.permission);
    } else {
        doDefault();
    }
});

router.get("/records/:rec_id", function (req, res) {
    res.setHeader("Content-Type", "text/json");

    var doDefault = function () {
        var avaActions = controller.getAvailableActions(modObj);
        var avaChildren = controller.getAvailableChildren(module_name);
        res.send(controller.appendGuide({}, avaActions, avaChildren));
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

    var rec_id = req.params.rec_id;
    var token = req.query.token;
    var module_name = "record";
    var modObj = relation.getNamedModule(module_name);
    var act = controller.getActionAndArgs(req, modObj.actions);

    if (act == null) {
        doDefault();
    } else if (act.action == "update") {
        act.func(req.ip, token, rec_id, act.args.key, doPrint, act.args.value);
    } else if (act.action == "delete") {
        act.func(req.ip, token, rec_id, doPrint);
    } else {
        doDefault();
    }
});

router.get("/groups/:grp_id", function (req, res) {
    res.setHeader("Content-Type", "text/json");

    var doDefault = function () {
        var avaActions = controller.getAvailableActions(modObj);
        var avaChildren = controller.getAvailableChildren(module_name);
        res.send(controller.appendGuide({}, avaActions, avaChildren));
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

    var grp_id = req.params.grp_id;
    var token = req.query.token;
    var module_name = "group";
    var modObj = relation.getNamedModule(module_name);
    var act = controller.getActionAndArgs(req, modObj.actions);

    if (act == null) {
        doDefault();
    } else if (act.action == "add") {
        act.func(req.ip, token, grp_id, act.args.target, doPrint);
    } else if (act.action == "show") {
        act.func(req.ip, token, grp_id, doPrint);
    } else if (act.action == "delete") {
        act.func(req.ip, token, grp_id, act.args.target, doPrint);
    } else if (act.action == "drop") {
        act.func(req.ip, token, grp_id, doPrint);
    } else {
        doDefault();
    }
});

module.exports = router;
