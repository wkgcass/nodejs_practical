var relation = require("./moduleRelation");

function Controller() {
    var doCheck = function (checkFunc, condition) {
        return checkFunc(condition);
    };
    var privateGetAvailableActions = function (actions, condition) {
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
    this.getAvailableActions = function (modObj, conditon) {
        return privateGetAvailableActions(modObj.actions, conditon);
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
    this.getConditon = function (req) {
        return {};
    }
    this.appendGuide = function (toAppend, actions, children) {
        toAppend['available_actions'] = actions;
        toAppend['available_resources'] = children;
        return JSON.stringify(toAppend, null, 4);
    }
}

var controller = new Controller();

module.exports = controller;