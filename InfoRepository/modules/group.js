var db = require("./db");
var config = require("../global/config");
var check = require("./check");
var checkEmladdr = require("./checkEmladdr");

var grpColl = db.get(config.mongo.coll.group);

var actions = [
    {
        "name": "add member",
        "method": "add",
        "args": [
            {
                "name": "target",
                "type": "string",
                "description": "target user id"
            }
        ],
        "return": {
            "success": {
                "value": "0",
                "type": "int",
                "description": "successfully added"
            },
            "error": [
                {
                    "value": "-501",
                    "type": "int",
                    "description": "already in group"
                },
                {
                    "value": "-502",
                    "type": "int",
                    "description": "user not found"
                }
            ]
        },
        "act": function (ip, token, group, target, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    grpColl.find({
                        "_id": group,
                        "leader": user_id
                    }, function (err, docs) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (docs == null || docs.length == 0) {
                                callback(301, "user cannot write the group");
                            } else {
                                var grp = docs[0];
                                for (var i = 0; i < grp.member.length; ++i) {
                                    if (grp.member[i] == target) {
                                        callback(-501, "already in group");
                                        return;
                                    }
                                }
                                checkEmladdr([target], function (err, res) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (res[target] == undefined) {
                                            callback(-502, "user not found");
                                        } else {
                                            grpColl.update({
                                                "_id": group
                                            }, {
                                                "$push": {
                                                    "member": target
                                                }
                                            });
                                            callback(false, 0);
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    },
    {
        "name": "show_member",
        "method": "show",
        "args": [],
        "return": {
            "success": {
                "value": "{leader:{user_id:$user_id,emladdr:$emladdr},member:[{user_id:$user_id,emladdr:$emladdr},...]}",
                "type": "object",
                "description": "leader and members"
            },
            "error": []
        },
        "act": function (ip, token, group, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    grpColl.find({
                        "_id": group,
                        "$or": [
                            {
                                "leader": user_id
                            },
                            {
                                "member": user_id
                            }
                        ]
                    }, function (err, docs) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (null == docs || docs.length == 0) {
                                callback(302, "user cannot read the group");
                            } else {
                                var grp = docs[0];
                                var user_ids = JSON.parse(JSON.stringify(grp.member));
                                user_ids.push(grp.leader);
                                checkEmladdr(user_ids, function (err, res) {
                                    if (err) {
                                        callback(err, res);
                                    } else {
                                        var retMem = [];
                                        for (var i = 0; i < grp.member.length; ++i) {
                                            retMem.push({
                                                "user_id": grp.member[i],
                                                "emladdr": res[grp.member[i]]
                                            });
                                        }
                                        callback(false, {
                                            "leader": {
                                                "user_id": grp.leader,
                                                "emladdr": res[grp.leader]
                                            },
                                            "member": retMem
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    },
    {
        "name": "delete_member",
        "method": "delete",
        "args": [
            {
                "name": "target",
                "type": "string",
                "description": "whose id to delete"
            }
        ],
        "return": {
            "success": {
                "value": 0,
                "type": "int",
                "description": "successfully deleted member"
            },
            "error": [
                {
                    "value": -601,
                    "type": "int",
                    "description": "member not found"
                }
            ]
        },
        "act": function (ip, token, group, target, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    grpColl.find({
                        "_id": group,
                        "leader": user_id,
                        "member": target
                    }, function (err, docs) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (docs == null || docs.length == 0) {
                                callback(-601, "member not found");
                            } else {
                                grpColl.update({
                                    "_id": docs[0]._id
                                }, {
                                    "$pull": {
                                        "member": target
                                    }
                                });
                                callback(false, 0);
                            }
                        }
                    });
                }
            });
        }
    },
    {
        "name": "drop_group",
        "method": "drop",
        "args": [],
        "return": {
            "success": {
                "value": 0,
                "type": "int",
                "description": "successfully deleted member"
            },
            "error": []
        },
        "act": function (ip, token, group, callback) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    grpColl.find({
                        "_id": group,
                        "leader": user_id
                    }, function (err, docs) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (docs == null || docs.length == 0) {
                                callback(301, "user cannot write the group");
                            } else {
                                grpColl.remove({
                                    "_id": docs[0]._id
                                });
                                callback(false, 0);
                            }
                        }
                    });
                }
            });
        }
    }
];

function Groups() {
    this.actions = actions;
    this.description = "group management";
    this.url = "/group/:group_id";
}
var groups = new Groups();
module.exports = groups;