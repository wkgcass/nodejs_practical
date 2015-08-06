var db = require("./db");
var config = require("../global/config");
var check = require("./check");

var repColl = db.get(config.mongo.coll.repository);
var grpColl = db.get(config.mongo.coll.group);

var actions = [
    {
        "name": "my_repositories",
        "method": "show",
        "args": [
            {
                "name": "token",
                "type": "string",
                "description": "token retrieved when logging in"
            }
        ],
        "return": {
            "success": {
                "value": "{R:[$read-only],W:[$writable],E:[$edit]}",
                "type": "object",
                "description": "retrieve repositories"
            },
            "error": []
        },
        "act": function (ip, token, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    repColl.find({
                        "users.read": user_id
                    }, function (err, docs) {
                        if (err) {
                            callback(err, null);
                        } else {
                            var doPush = function (docs, toArr, cursor, callback) {
                                if (docs.length == cursor) {
                                    callback();
                                } else {
                                    var doc = docs[cursor];
                                    var flag = true;
                                    for (var i = 0; i < toArr.length; ++i) {
                                        if (toArr[i].id == doc._id) {
                                            flag = false;
                                            break;
                                        }
                                    }
                                    if (flag) {
                                        toArr.push({
                                            "id": doc._id,
                                            "name": doc.name
                                        });
                                    }
                                    doPush(docs, toArr, cursor + 1, callback);
                                }
                            };
                            // user read
                            var r = [];
                            doPush(docs, r, 0, function () {
                                repColl.find({
                                    "users.write": user_id
                                }, function (err, docs) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        // user write
                                        var w = [];
                                        doPush(docs, w, 0, function () {
                                            repColl.find({
                                                "users.edit": user_id
                                            }, function (err, docs) {
                                                // user edit
                                                var e = [];
                                                doPush(docs, e, 0, function () {
                                                    // get user group
                                                    grpColl.find({
                                                        "member": user_id
                                                    }, function (err, docs) {
                                                        if (err) {
                                                            callback(err, null);
                                                        } else {
                                                            for (var i = 0; i < docs.length; ++i) {
                                                                var group_id = docs[i]._id;
                                                                repColl.find({
                                                                    "groups.read": group_id
                                                                }, function (err, docs) {
                                                                    if (err) {
                                                                        callback(err, null);
                                                                    } else {
                                                                        // group read
                                                                        doPush(docs, r, 0, function () {
                                                                            repColl.find({
                                                                                "groups.write": group_id
                                                                            }, function (err, docs) {
                                                                                if (err) {
                                                                                    callback(err, null);
                                                                                } else {
                                                                                    // group write
                                                                                    doPush(docs, w, 0, function () {
                                                                                        repColl.find({
                                                                                            "groups.edit": group_id
                                                                                        }, function (err, docs) {
                                                                                            // group edit
                                                                                            doPush(docs, e, 0, function () {
                                                                                                callback(false, {
                                                                                                    "R": r,
                                                                                                    "W": w,
                                                                                                    "E": e
                                                                                                })
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                }
                                                                            })
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    });
                                                });
                                            });
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
    },
    {
        "name": "create_repository",
        "method": "create",
        "args": [
            {
                "name": "token",
                "type": "string",
                "description": "token retrieved when logging in"
            },
            {
                "name": "name",
                "type": "string",
                "description": "name of the repository"
            },
            {
                "name": "encrypt",
                "type": "enum(plain, aes, rsa)"
            },
            {
                "name": "is_group",
                "type": "bool",
                "description": "create the repository in the name of a group or a person"
            }
        ],
        "return": {
            "success": {
                "value": 0,
                "type": "int",
                "description": "repository successfully created"
            },
            "error": [
                {
                    "value": -101,
                    "description": "not a group leader"
                }
            ]
        },
        "act": function (ip, token, name, encrypt, is_group, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    var doCreate = function (is_group, id) {
                        var toInsert;
                        if (is_group) {
                            toInsert = {
                                "name": name,
                                "encrypt": encrypt,
                                "users": {
                                    "read": [], "write": [], "edit": []
                                },
                                "groups": {
                                    "read": [], "write": [], "edit": [id]
                                }
                            };
                        } else {
                            toInsert = {
                                "name": name,
                                "encrypt": encrypt,
                                "users": {
                                    "read": [], "write": [], "edit": [id]
                                },
                                "groups": {
                                    "read": [], "write": [], "edit": []
                                }
                            };
                        }
                        repColl.insert(toInsert, {}, function (err, res) {
                            if (err) {
                                callback(err, res);
                            } else {
                                callback(false, 0);
                            }
                        });
                    };
                    if (is_group) {
                        grpColl.find({
                            "leader": user_id
                        }, function (err, docs) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (docs != null && docs.length > 0) {
                                    doCreate(true, docs[0]._id);
                                } else {
                                    callback(-101, "not a group leader");
                                }
                            }
                        });
                    } else {
                        doCreate(false, user_id);
                    }
                }
            });
        }
    }
];