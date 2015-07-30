var relation = require("./moduleRelation");

function Controller() {
    var doCheck = function (checkFunc, condition) {
        return checkFunc(condition);
    };
    this.getAvailableActions = function (actions, condition) {
        var ret = [];
        if (actions != null) {
            for (var i = 0; i < actions.length; ++i) {
                var action = actions[i];
                if (doCheck(action.check, condition)) {
                    var tmp = {
                        "name": action["name"],
                        "method": action["method"],
                        "args": action["args"],
                        "return": action["return"],
                        "description": action["description"]
                    };
                    ret.push(tmp);
                }
            }
        }
        return ret;
    };
    this.getAvailableChildren = function (module, condition) {
        var ret = [];
        var children = relation.findChildren(module);
        if (null != children) {
            for (var name in children) {
                var mod = require(children[name]);
                if (doCheck(mod.check, condition)) {
                    var tmp = {
                        "name": name,
                        "url": mod["url"],
                        "description": mod["description"]
                    };
                    ret.push(tmp);
                }
            }
        }
        return ret;
    }
}

var controller = new Controller();

module.exports = controller;