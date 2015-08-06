var relation = require("./moduleRelation");

function Controller() {
    var privateGetAvailableActions = function (actions) {
        var ret = [];
        if (actions != null) {
            for (var i = 0; i < actions.length; ++i) {
                var action = actions[i];
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
        return ret;
    };
    this.getAvailableActions = function (modObj) {
        return privateGetAvailableActions(modObj.actions);
    };
    this.getAvailableChildren = function (module) {
        var ret = [];
        var children = relation.findChildren(module);
        if (null != children) {
            for (var name in children) {
                var mod = require(children[name]);
                var tmp = {
                    "name": name,
                    "url": mod["url"],
                    "description": mod["description"]
                };
                ret.push(tmp);
            }
        }
        return ret;
    };
    this.appendGuide = function (toAppend, actions, children) {
        toAppend['available_actions'] = actions;
        toAppend['available_resources'] = children;
        return JSON.stringify(toAppend, null, 4);
    };
    this.getNamedActionFunc = function (name, actions) {
        for (var i = 0; i < actions.length; ++i) {
            if (actions[i].name == name) {
                return actions[i].act;
            }
        }
        return null;
    };
    this.handleResult = function (err, res, callback) {
        if (err) {
            callback({
                "state": "error",
                "err": err,
                "res": res
            });
        } else {
            callback({
                "state": "success",
                "res": res
            });
        }
    };
    this.getActionAndArgs = function (req, actions) {
        var query = req.query;
        for (var i = 0; i < actions.length; ++i) {
            var action = actions[i];
            for (var key in query) {
                if (key == action.method && query[key] == "") {
                    var args = {};
                    for (var j = 0; j < action.args.length; ++j) {
                        var arg = action.args[j];
                        args[arg.name] = req.query[arg.name];
                    }
                    return {
                        "action": action.method,
                        "func": action.act,
                        "args": args
                    };
                }
            }
        }
        return null;
    }
}

var controller = new Controller();

module.exports = controller;