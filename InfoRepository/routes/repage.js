var express = require('express');
var router = express.Router();
var controller = require("../modules/controller");
var relation = require("../modules/moduleRelation");
var language = require("../global/language");

function getClientIp(req) {
    var ipAddress;
    var forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
};

router.get('/', function (req, res) {
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
    res.render("welcome", {
        "lan": language.lan[lan]
    });
});

router.get('/my', function (req, res) {
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

        showFunc(getClientIp(req), token, function (err, result) {
            if (err) {
                res.render("error", {
                    "message": result,
                    "error": {
                        "status": err
                    }
                });
            } else {
                var options = {
                    "rep": result,
                    "lan": language.lan[lan]
                };
                groupFunc(getClientIp(req), token, function (err, result) {
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
        showRec(getClientIp(req), token, rep, function (err, res1) {
            if (err) {
                res.render("error", {
                    "message": res1,
                    "error": {
                        "status": err
                    }
                });
            } else {
                showPer(getClientIp(req), token, rep, function (err, res2) {
                    if (err) {
                        res.render("error", {
                            "message": res2,
                            "error": {
                                "status": err
                            }
                        });
                    } else {
                        res.render("rep", {
                            "records": res1,
                            "permissions": res2,
                            "lan": language.lan[lan]
                        });
                    }
                });
            }
        });
    }
});

router.get("/grp", function (req, res) {
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

    var token = req.query.token;
    var grp = req.query.grp;
    if (token == undefined || grp == undefined) {
        res.render("error", {
            "title": "ERROR",
            "message": "you should request this page with proper arguments",
            "error": {
                "status": "arguments not found",
                "stack": ""
            }
        });
    } else {
        var module_name = "group";
        var modObj = relation.getNamedModule(module_name);
        var showMem = controller.getNamedActionFunc("show_member", modObj.actions);
        showMem(getClientIp(req), token, grp, function (err, res1) {
            if (err) {
                res.render("error", {
                    "message": res1,
                    "error": {
                        "status": err
                    }
                });
            } else {
                res.render("grp.jade", {
                    "grp": res1,
                    "lan": language.lan[lan]
                });
            }
        });
    }
});

module.exports = router;