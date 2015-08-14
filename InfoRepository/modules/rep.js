var db = require("./db");
var config = require("../global/config");
var check = require("./check");
var checkEmladdr = require("./checkEmladdr");

var repColl = db.get(config.mongo.coll.repository);
var grpColl = db.get(config.mongo.coll.group);
var recColl = db.get(config.mongo.coll.record);

var doCheck = require("./checkRepAccess");

var findIdInRep = function (rep, id, is_group) {
    var i = 0;
    if (is_group) {
        for (i = 0; i < rep.groups.read.length; ++i) {
            if (rep.groups.read[i] == id) {
                return "read";
            }
        }
        for (i = 0; i < rep.groups.write.length; ++i) {
            if (rep.groups.write[i] == id) {
                return "write";
            }
        }
        for (i = 0; i < rep.groups.edit.length; ++i) {
            if (rep.groups.edit[i] == id) {
                return "edit";
            }
        }
    } else {
        for (i = 0; i < rep.users.read.length; ++i) {
            if (rep.users.read[i] == id) {
                return "read";
            }
        }
        for (i = 0; i < rep.users.write.length; ++i) {
            if (rep.users.write[i] == id) {
                return "write";
            }
        }
        for (i = 0; i < rep.users.edit.length; ++i) {
            if (rep.users.edit[i] == id) {
                return "edit";
            }
        }
    }
    return null;
};

var actions = [
    {
        "name": "drop_repository",
        "method": "drop",
        "args": [],
        "return": {
            "success": {
                "value": 0,
                "type": "int",
                "description": "the repository has been dropped"
            },
            "error": []
        },
        "act": function (ip, token, rep, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    doCheck("edit", rep, user_id, function (err, res) {
                        if (err) {
                            callback(err, res);
                        } else {
                            repColl.remove({
                                "_id": rep
                            }, {}, function (err, res) {
                                if (err) {
                                    callback(err, res);
                                } else {
                                    callback(false, 0);
                                }
                            });
                        }
                    });

                }
            });
        }
    },
    {
        "name": "add_record",
        "method": "add",
        "args": [
            {
                "name": "record",
                "type": "object",
                "format": "{$key:$value,...}",
                "description": "record to insert"
            }
        ],
        "return": {
            "success": {
                "value": 0,
                "type": "int",
                "description": "record successfully added"
            },
            "error": [
                {
                    "value": -301,
                    "type": "int",
                    "description": "invalid record format"
                },
                {
                    "value": -302,
                    "type": "int",
                    "description": "record don't match columns defined in repository"
                }
            ]
        },
        "act": function (ip, token, rep, record, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    doCheck("write", rep, user_id, function (err, res) {
                        var rep = res.rep;

                        if (err) {
                            callback(err, res);
                        } else {
                            if (rep.structure != null) {
                                // format check
                                var count = 0;
                                for (var key in record) {
                                    ++count;

                                    if ((typeof record[key]) != "string") {
                                        callback(-301, "invalid record format");
                                        return;
                                    }

                                    var flag = false;
                                    for (var i = 0; i < rep.structure.length; ++i) {
                                        if (rep.structure[i] == key) {
                                            flag = true;
                                            break;
                                        }
                                    }
                                    if (!flag) {
                                        callback(-302, "record don't match columns defined in repository");
                                        return;
                                    }
                                }
                                if (count != rep.structure.length) {
                                    callback(-302, "record don't match columns defined in repository");
                                    return;
                                }
                            }

                            recColl.insert({
                                "rep": rep._id.toString(),
                                "content": record
                            });
                            callback(false, 0);
                        }

                    });
                }
            });
        }
    },
    {
        "name": "show_records",
        "method": "show",
        "args": [],
        "return": {
            "success": {
                "value": "{rep_id:'',encrypt:'',name:'',structure:[...],records:[{...},...]}",
                "type": "int",
                "description": "the repository has been dropped"
            },
            "error": []
        },
        "act": function (ip, token, rep, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    doCheck("read", rep, user_id, function (err, res) {
                        if (err) {
                            callback(err, res);
                        } else {
                            var rep_obj = res.rep;
                            recColl.find({
                                "rep": rep
                            }, function (err, docs) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    var doPush = function (arr, cursor, toArr, cb) {
                                        if (arr.length == cursor) {
                                            cb(toArr);
                                        } else {
                                            arr[cursor].content._id = arr[cursor]._id;
                                            toArr.push(arr[cursor].content);
                                            doPush(arr, cursor + 1, toArr, cb);
                                        }
                                    };

                                    doPush(docs, 0, [], function (res) {
                                        callback(false, {
                                            "rep_id": rep_obj._id.toString(),
                                            "name": rep_obj.name,
                                            "encrypt": rep_obj.encrypt,
                                            "structure": rep_obj.structure,
                                            "records": res
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    },
    {
        "name": "show_permission",
        "method": "permission",
        "args": [],
        "return": {
            "success": {
                "value": "{U:{R:[$read_only{user_id:...,emladdr:...}],W:[$writable],E:[$editable]}, G:{R:[{group_id,name}],W,E}}",
                "type": "object",
                "description": "permission information"
            },
            "error": []
        },
        "act": function (ip, token, rep, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    doCheck("read", rep, user_id, function (err, res) {
                        if (err) {
                            callback(err, res);
                        } else {
                            var rep = res.rep;
                            var userToCheck = [];
                            for (var i = 0; i < rep.users.read.length; ++i) {
                                userToCheck.push(rep.users.read[i]);
                            }
                            for (i = 0; i < rep.users.write.length; ++i) {
                                userToCheck.push(rep.users.write[i]);
                            }
                            for (i = 0; i < rep.users.edit.length; ++i) {
                                userToCheck.push(rep.users.edit[i]);
                            }
                            checkEmladdr(userToCheck, function (err, res) {
                                if (err) {
                                    callback(err, res);
                                } else {
                                    var ur = [];
                                    for (i = 0; i < rep.users.read.length; ++i) {
                                        ur.push({
                                            "user_id": rep.users.read[i],
                                            "emladdr": res[rep.users.read[i]]
                                        });
                                    }
                                    var uw = [];
                                    for (i = 0; i < rep.users.write.length; ++i) {
                                        uw.push({
                                            "user_id": rep.users.write[i],
                                            "emladdr": res[rep.users.write[i]]
                                        });
                                    }
                                    var ue = [];
                                    for (i = 0; i < rep.users.edit.length; ++i) {
                                        ue.push({
                                            "user_id": rep.users.edit[i],
                                            "emladdr": res[rep.users.edit[i]]
                                        });
                                    }

                                    var findGroup = function (arr, cursor, store, cb) {
                                        if (cursor >= arr.length) {
                                            cb(store);
                                        } else {
                                            var group_id = arr[cursor];
                                            grpColl.find({
                                                "_id": group_id
                                            }, function (err, docs) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    if (docs == null || docs.length == 0) {
                                                        findGroup(arr, cursor + 1, store, cb);
                                                    } else {
                                                        store.push({
                                                            "group_id": docs[0]._id.toString(),
                                                            "name": docs[0].name
                                                        });
                                                        findGroup(arr, cursor + 1, store, cb);
                                                    }
                                                }
                                            });
                                        }
                                    };

                                    findGroup(rep.groups.read, 0, [], function (gr) {
                                        findGroup(rep.groups.write, 0, [], function (gw) {
                                            findGroup(rep.groups.edit, 0, [], function (ge) {
                                                callback(false, {
                                                    "U": {
                                                        "R": ur,
                                                        "W": uw,
                                                        "E": ue
                                                    },
                                                    "G": {
                                                        "R": gr,
                                                        "W": gw,
                                                        "E": ge
                                                    }
                                                });
                                            });
                                        })
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    },
    {
        "name": "set_permission",
        "method": "setPermission",
        "args": [
            {
                "name": "id",
                "type": "string",
                "description": "(user_id or group_id) whose id to add"
            },
            {
                "name": "is_group",
                "type": "bool",
                "description": "is group"
            },
            {
                "name": "permission",
                "type": "enum(R,W,E)",
                "optional": true,
                "description": "permission level R:read-only, W:writable, E:editable(can change permission), undefined means remove"
            }
        ],
        "return": {
            "success": {
                "value": 0,
                "type": "int",
                "description": "successfully added permission"
            },
            "error": [
                {
                    "value": -701,
                    "type": "int",
                    "description": "permission alias not found"
                }
            ]
        },
        "act": function (ip, token, rep, id, is_group, callback, permission) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    doCheck("edit", rep, user_id, function (err, res) {
                        if (err) {
                            callback(err, res);
                        } else {
                            var rep = res.rep;
                            var per = findIdInRep(rep, id, is_group);

                            var doSet = function () {
                                if (permission == undefined) {
                                    callback(false, 0);
                                    return;
                                }
                                if (permission != "R" && permission != "W" && permission != "E") {
                                    callback(-701, "permission alias not found");
                                } else {
                                    var operation = {};
                                    var act = null;
                                    if (permission == "R") {
                                        act = "read";
                                    } else if (permission == "W") {
                                        act = "write";
                                    } else if (permission == "E") {
                                        act = "edit";
                                    }
                                    if (is_group) {
                                        operation["groups." + act] = id;
                                    } else {
                                        operation["users." + act] = id;
                                    }
                                    repColl.update({
                                        "_id": rep._id
                                    }, {
                                        "$push": operation
                                    });
                                    callback(false, 0);
                                }
                            };

                            if (per == null) {
                                doSet();
                            } else {
                                var operation = {};
                                if (is_group) {
                                    operation["groups." + per] = id
                                } else {
                                    operation["users." + per] = id
                                }
                                repColl.update({
                                    "_id": rep._id
                                }, {
                                    "$pull": operation
                                }, {}, function (err, res) {
                                    if (err) {
                                        callback(err, res);
                                    } else {
                                        doSet();
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    }
];

function Rep() {
    this.actions = actions;
    this.description = "repository management";
    this.url = "/rep/:repository_id";
}
var rep = new Rep();
module.exports = rep;