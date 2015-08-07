var db = require("./db");
var config = require("../global/config");
var check = require("./check");

var repColl = db.get(config.mongo.coll.repository);
var recColl = db.get(config.mongo.coll.record);

var doCheck = require("./checkRepAccess");

var actions = [
    {
        "name": "update",
        "method": "update",
        "args": [
            {
                "name": "key",
                "type": "string",
                "description": "key to update"
            },
            {
                "name": "value",
                "type": "string",
                "optional": true,
                "description": "value of the updated key, don't give this arg if you want to drop the key"
            }
        ],
        "return": {
            "success": {
                "value": 0,
                "type": "int",
                "description": "the record has been successfully updated"
            },
            "error": [
                {
                    "value": -401,
                    "type": "int",
                    "description": "cannot find designated key (only when updating a repository with structure)"
                }
            ]
        },
        "actions": function (ip, token, record, key, callback, value) {
            check(ip, token, function (err, res) {
                if (err) {
                    callback(err, res);
                } else {
                    var user_id = res.user_id;
                    recColl.find({
                        "_id": record
                    }, function (err, docs) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (docs == null || docs.length == 0) {
                                callback(201, "record not found");
                            }
                            doCheck("write", docs[0].rep, user_id, function (err, res) {
                                if (err) {
                                    callback(err, res);
                                } else {
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