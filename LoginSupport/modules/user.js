var db = require("./db");
var config = require("../global/config");
var coll = db.get(config.mongo.coll);
var tokenColl = db.get(config.mongo.token_coll);
var encoder = require("../global/encoder");
var ipcheck = require("./ipcheck");

function validPwd(pwd) {
    if (pwd.length < 6) {
        return false;
    }
    var reg = /^[a-z0-9]+$/i;
    return reg.test(pwd);
}

function isDeprecated(token) {
    if (token.deprecated) {
        return true;
    } else {
        if (token.dead_time > Date.now()) {
            return false;
        } else {
            tokenColl.update({
                "_id": token._id
            }, {
                "$set": {
                    "deprecated": true
                }
            });
            return true;
        }
    }
}

var actions = [
    {
        "name": "check_token",
        "method": "check",
        "args": [
            {
                "name": "token",
                "type": "string",
                "description": "token retrieved when logging in"
            },
            {
                "name": "refresh",
                "optional": true,
                "type": "bool",
                "description": "true then the system refreshes the token's last visit time, false otherwise"
            }
        ],
        "return": {
            "success": {
                "value": "{$token_state}",
                "type": "object",
                "description": "retrieve designated token state, including info like user_email, token_id, bound_ip, last_visit, dead_time"
            },
            "error": []
        },
        /**
         *
         * @param ip string client ip address
         * @param token string user token
         * @param callback function(err, res)
         * @param refresh bool refresh the token state
         */
        "act": function (ip, token, callback, refresh) {
            if (refresh == undefined) {
                refresh = false;
            }
            tokenColl.find({
                "token": token
            }, function (err, docs) {
                if (err) {
                    callback(err, null);
                } else {
                    if (null == docs || docs.length == 0) {
                        callback(101, "token not found");
                    } else {
                        var token = docs[0];
                        ipcheck(ip, function (err, ipInfo) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (ipInfo.country == token.ip_info.country
                                    && ipInfo.region == token.ip_info.region
                                    && ipInfo.city == token.ip_info.city
                                    ) {
                                    var user_id = token.user;
                                    coll.find({
                                        "_id": user_id
                                    }, function (err, userDocs) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (null == userDocs || userDocs.length == 0) {
                                                tokenColl.delete({
                                                    "_id": token._id
                                                });
                                                callback(101, "token not found");
                                            } else {
                                                var user = userDocs[0];
                                                if (refresh && !token.deprecated) {
                                                    tokenColl.update({
                                                        "_id": token._id
                                                    }, {
                                                        "$set": {
                                                            "last_visit": Date.now()
                                                        }
                                                    });
                                                }
                                                callback(false, {
                                                    "user_id": user._id,
                                                    "user_email": user.emladdr,
                                                    "token_id": token.token,
                                                    "ip_info": token.ip_info,
                                                    "last_visit": new Date(token.last_visit).toLocaleString(),
                                                    "dead_time": new Date(token.dead_time).toLocaleString(),
                                                    "deprecated": token.deprecated
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    callback(103, "requester does not have access to this token");
                                }
                            }
                        });
                    }
                }
            });
        }
    },
    {
        "name": "logout",
        "method": "logout",
        "args": [
            {
                "name": "token",
                "type": "string",
                "description": "user token you retrieved when logging in"
            }
        ],
        "return": {
            "success": {
                "value": "0",
                "type": "int",
                "description": "you have successfully logged out"
            },
            "error": []
        },
        "act": function (ip, token, callback) {
            tokenColl.find({
                "token": token
            }, function (err, docs) {
                if (err) {
                    callback(err, null);
                } else {
                    var tok = docs[0];
                    if (isDeprecated(tok)) {
                        callback(102, "token is deprecated");
                    } else {
                        ipcheck(ip, function (err, ipInfo) {
                            if (ipInfo.country == tok.ip_info.country
                                && ipInfo.region == tok.ip_info.region
                                && ipInfo.city == tok.ip_info.city
                                ) {
                                callback(false, 0);
                                tokenColl.update({
                                    "_id": tok._id
                                }, {
                                    "$set": {
                                        "deprecated": true
                                    }
                                });
                            } else {
                                callback(101, "token not found");
                            }
                        });
                    }
                }
            });
        }
    },
    {
        "name": "logout_all",
        "method": "logoutAll",
        "args": [
            {
                "name": "token",
                "type": "string",
                "description": "user token you retrieved when logging in"
            }
        ],
        "return": {
            "success": {
                "value": "0",
                "type": "int",
                "description": "you have successfully logged out all existing tokens"
            },
            "error": []
        },
        "act": function (ip, token, callback) {
            tokenColl.find({
                "token": token
            }, function (err, docs) {
                if (err) {
                    callback(err, null);
                } else {
                    var tok = docs[0];
                    if (isDeprecated(tok)) {
                        callback(102, "token is deprecated");
                    } else {
                        ipcheck(ip, function (err, ipInfo) {
                            if (ipInfo.country == tok.ip_info.country
                                && ipInfo.region == tok.ip_info.region
                                && ipInfo.city == tok.ip_info.city
                                ) {
                                callback(false, 0);
                                tokenColl.update({
                                    "user": tok.user,
                                    "deprecated": false
                                }, {
                                    "$set": {
                                        "deprecated": true
                                    }
                                }, {
                                    "multi": true
                                });
                            } else {
                                callback(101, "token not found");
                            }
                        });
                    }
                }
            });
        }
    },
    {
        "name": "change_pwd",
        "method": "changePWD",
        "args": [
            {
                "name": "token",
                "type": "string",
                "description": "user token you retrieved when logging in"
            },
            {
                "name": "opwd",
                "type": "string",
                "description": "original password, encrypted with RSA public key. see index for more info"
            },
            {
                "name": "npwd",
                "type": "string",
                "description": "new password, , encrypted with RSA public key. see index for more info"
            }
        ],
        "return": {
            "success": {
                "value": "0",
                "type": "int",
                "description": "your password has successfully changed"
            },
            "error": [
                {
                    "value": "-501",
                    "type": "int",
                    "description": "wrong original password"
                },
                {
                    "value": "-502",
                    "type": "int",
                    "description": "invalid new password",
                    "format": "longer than 6 words and contain only english UPPER/down case characters and 0~9"
                }
            ]
        },
        "act": function (ip, token, opwd, npwd, callback) {
            tokenColl.find({
                "token": token, "deprecated": false
            }, function (err, docs) {
                if (err) {
                    callback(err, null);
                } else {
                    if (null == docs || docs.length == 0) {
                        callback(101, "token not found")
                    } else {
                        var token = docs[0];
                        if (isDeprecated(token)) {
                            callback(102, "token is deprecated");
                        } else {
                            // get user
                            coll.find({
                                "_id": token.user
                            }, function (err, userDocs) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (userDocs == null || userDocs.length == 0) {
                                        tokenColl.remove({"_id": token._id});
                                        callback(101, "token not found");
                                    } else {
                                        var user = userDocs[0];
                                        try {
                                            var op = encoder.decodeRSA(opwd);
                                            var np = encoder.decodeRSA(npwd);
                                        } catch (err) {
                                            callback(err, null);
                                            return;
                                        }
                                        if (validPwd(np)) {
                                            if (encoder.saltMD5(op) == user.pwd) {
                                                var saltMD5 = encoder.saltMD5(np);
                                                // change pwd
                                                coll.update({
                                                    "_id": user._id
                                                }, {
                                                    "$set": {
                                                        "pwd": saltMD5
                                                    }
                                                });
                                                // disable all tokens
                                                tokenColl.update({
                                                    "user": user._id,
                                                    "deprecated": false
                                                }, {
                                                    "$set": {
                                                        "deprecated": true
                                                    }
                                                }, {
                                                    "multi": true
                                                });
                                                callback(false, 0);
                                            } else {
                                                callback(-501, "wrong original password");
                                            }
                                        } else {
                                            callback(-502, "invalid new password");
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }
    }
];

function Users() {
    this.actions = actions;
    this.description = "basic user management";
    this.url = "/passport/{$token}";
}
var users = new Users();
module.exports = users;