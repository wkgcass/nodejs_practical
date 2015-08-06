var express = require('express');
var router = express.Router();
var controller = require("../modules/controller");
var relation = require("../modules/moduleRelation");
var module_name = "repository";
var modObj = relation.getNamedModule(module_name);

router.get('/', function (req, res, next) {
    var condition = controller.getConditon(req);
    res.setHeader("Content-Type", "application/json");
    var avaActions = controller.getAvailableActions(modObj, condition);
    var avaChildren = controller.getAvailableChildren(module_name, condition);
    res.send(controller.appendGuide({}, avaActions, avaChildren));
});

module.exports = router;
