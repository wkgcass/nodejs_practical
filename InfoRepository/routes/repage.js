var express = require('express');
var router = express.Router();
var controller = require("../modules/controller");
var relation = require("../modules/moduleRelation");

router.get('/', function (req, res) {
    res.render("welcome");
});

router.get('/my', function (req, res) {
    var token = req.query.token;
    if (token == undefined) {
        res.render("error", {
            "title": "ERROR",
            "message": "you should request this page with a token",
            "error": {
                "status": "token not found",
                "stack": ""
            }
        });
    } else {
        var module_name = "me";
        var modObj = relation.getNamedModule(module_name);
        var showFunc = controller.getNamedActionFunc("my_repositories", modObj.actions);
        var groupFunc = controller.getNamedActionFunc("my_groups", modObj.actions);

        showFunc(req.ip, token, function (err, result) {
            if (err) {
                res.render("error", {
                    "message": result,
                    "error": {
                        "status": err
                    }
                });
            } else {
                var options = {
                    "rep": result
                };
                groupFunc(req.ip, token, function (err, result) {
                    if (err) {
                        res.render("error", {
                            "message": result,
                            "error": {
                                "status": err
                            }
                        });
                    } else {
                        options["grp"] = result;
                        res.render("my", options);
                    }
                });
            }
        });
    }
});

router.get("/rep", function (req, res) {
    var token = req.query.token;
    var rep = req.query.rep;
    if (token == undefined || rep == undefined) {
        res.render("error", {
            "title": "ERROR",
            "message": "you should request this page with proper arguments",
            "error": {
                "status": "arguments not found",
                "stack": ""
            }
        });
    } else {
        var module_name = "repository";
        var modObj = relation.getNamedModule(module_name);
        var showRec = controller.getNamedActionFunc("show_records", modObj.actions);
        var showPer = controller.getNamedActionFunc("show_permission", modObj.actions);
        showRec(req.ip, token, rep, function (err, res1) {
            if (err) {
                res.render("error", {
                    "message": res1,
                    "error": {
                        "status": err
                    }
                });
            } else {
                showPer(req.ip, token, req, function (err, res2) {
                    if (err) {
                        res.render("error", {
                            "message": res2,
                            "error": {
                                "status": err
                            }
                        });
                    } else {
                        res.render("rep.jade", {
                            "records": res1,
                            "permissions": res2
                        });
                    }
                });
            }
        });
    }
});

module.exports = router;