var db = require("./db");
var config = require("../global/config");

var repColl = db.get(config.mongo.coll.repository);
var grpColl = db.get(config.mongo.coll.group);

module.exports = function (toCheck, rep, user_id, callback) {
    repColl.find({
        "_id": rep
    }, function (err, docs) {
        if (err) {
            callback(err, null);
        } else {
            if (docs == null || docs.length == 0) {
                callback(101, "repository not found");
            } else {
                var rep = docs[0];

                var checkUser = function (key) {
                    for (var i = 0; i < rep.users[key].length; ++i) {
                        if (rep.users[key][i] == user_id) {
                            return {
                                "is_group": false,
                                "rep": rep
                            };
                        }
                    }
                    return null;
                };

                var possibleRet = null;
                if (toCheck == "read") {
                    possibleRet = checkUser("read");
                    if (null == possibleRet) {
                        possibleRet = checkUser("write");
                        if (null == possibleRet) {
                            possibleRet = checkUser("edit");
                            if (null != possibleRet) {
                                callback(false, possibleRet);
                                return;
                            }
                        } else {
                            callback(false, possibleRet);
                            return;
                        }
                    } else {
                        callback(false, possibleRet);
                        return;
                    }
                } else if (toCheck == "write") {
                    possibleRet = checkUser("write");
                    if (null == possibleRet) {
                        possibleRet = checkUser("edit");
                        if (null != possibleRet) {
                            callback(false, possibleRet);
                            return;
                        }
                    } else {
                        callback(false, possibleRet);
                        return;
                    }
                } else {
                    possibleRet = checkUser("edit");
                    if (null != possibleRet) {
                        callback(false, possibleRet);
                        return;
                    }
                }

                grpColl.find({
                    "$or": [
                        {
                            "member": user_id
                        },
                        {
                            "leader": user_id
                        }
                    ]
                }, function (err, docs) {
                    if (err) {
                        callback(err, null);
                    } else {
                        var checkGroup = function (key) {
                            for (var i = 0; i < docs.length; ++i) {
                                for (var j = 0; j < rep.groups[key].length; ++j) {
                                    if (rep.groups[key][j] == docs[i]._id.toString()) {
                                        return {
                                            "is_group": true,
                                            "id": docs[i]._id,
                                            "rep": rep
                                        };
                                    }
                                }
                            }
                            return null;
                        };

                        if (toCheck == "read") {
                            possibleRet = checkGroup("read");
                            if (null == possibleRet) {
                                possibleRet = checkGroup("write");
                                if (null == possibleRet) {
                                    possibleRet = checkGroup("edit");
                                    if (null == possibleRet) {
                                        callback(104, "user cannot read the repository");
                                    } else {
                                        callback(false, possibleRet);
                                    }
                                } else {
                                    callback(false, possibleRet);
                                }
                            } else {
                                callback(false, possibleRet);
                            }
                        } else if (toCheck == "write") {
                            possibleRet = checkGroup("write");
                            if (null == possibleRet) {
                                possibleRet = checkGroup("edit");
                                if (null == possibleRet) {
                                    callback(103, "user cannot write the repository");
                                } else {
                                    callback(false, possibleRet);
                                }
                            } else {
                                callback(false, possibleRet);
                            }
                        } else {
                            possibleRet = checkGroup("edit");
                            if (null == possibleRet) {
                                callback(102, "user cannot edit the repository");
                            } else {
                                callback(false, possibleRet);
                            }
                        }
                    }
                });
            }
        }
    });
};