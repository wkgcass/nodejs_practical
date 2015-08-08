var db = require("./db");
var config = require("../global/config");
var check = require("./check");
var checkEmladdr = require("./checkEmladdr");

var repColl = db.get(config.mongo.coll.repository);
var grpColl = db.get(config.mongo.coll.group);
var recColl = db.get(config.mongo.coll.record);

var doCheck = require("./checkRepAccess");

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
        "actions": function (ip, token, rep, callback) {
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
                "description": "the repository has been dropped"
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
        "actions": function (ip, token, rep, record, callback) {
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
                                "rep": rep,
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
                "value": 0,
                "type": "int",
                "description": "the repository has been dropped"
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
        "actions": function (ip, token, rep, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    doCheck("read", rep, user_id, function (err, res) {
                        if (err) {
                            callback(err, res);
                        } else {
                            recColl.find({
                                "rep": rep
                            }, function (err, docs) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    var ret = [];
                                    for (var i = 0; i < docs.length; ++i) {
                                        docs[i].content["_id"] = docs[i]._id;
                                        ret.push(docs[i].content);
                                    }
                                    callback(false, ret);
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
                "value": "{U:{R:[$read_only{user_id:...,emladdr:...}],W:[$writable],E:[$editable]}, G:{R,W,E}}",
                "type": "object",
                "description": "permission information"
            },
            "error": []
        },
        "actions": function (ip, token, rep, callback) {
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
                                userToCheck.push(rep.write[i]);
                            }
                            for (i = 0; i < rep.users.edit.length; ++i) {
                                userToCheck.push(rep.edit[i]);
                            }
                            checkEmladdr(userToCheck, function (err, res) {
                                if (err) {
                                    callback(err, null);
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
                                            cb(false, store);
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
                                                            "id": docs[0]._id,
                                                            "name": docs[0].name
                                                        });
                                                        findGroup(arr, cursor + 1, store, cb);
                                                    }
                                                }
                                            });
                                        }
                                    };
                                    // TODO
                                }
                            });
                        }
                    });
                }
            });
        }
    }
];