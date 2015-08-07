var db = require("./db");
var config = require("../global/config");
var check = require("./check");

var repColl = db.get(config.mongo.coll.repository);
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
                    checkRepAccess("edit", rep, user_id, function (err, res) {
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
                    checkRepAccess("write", rep, user_id, function (err, res) {
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
                    checkRepAccess("read", rep, user_id, function (err, res) {
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
    }
];