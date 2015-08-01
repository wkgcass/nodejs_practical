var db = require("./db");
var config = require("../global/config");
var coll = db.get(config.mongo.coll);
var tokenColl = db.get(config.mongo.token_coll);
var regColl = db.get(config.mongo.reg_coll);
var encoder = require("../global/encoder");
var http = require("http");
var mail = require("./mail");

function isEmail(str) {
    var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    return reg.test(str);
}

function validPwd(pwd) {
    if (pwd.length < 6) {
        return false;
    }
    var reg = /^[a-z0-9]+$/i;
    return reg.test(pwd);
}

var actions = [
    {
        "name": "login",
        "check": function (condition) {
            return true;
        },
        "method": "login",
        "args": [
            {
                "name": "emladdr",
                "type": "string",
                "description": "e-mail address"
            },
            {
                "name": "pwd",
                "type": "string",
                "description": "password encrypted with given RAS public key. see index for more info"
            }
        ],
        "return": {
            "success": {
                "value": "{$token}",
                "type": "string",
                "description": "user token"
            },
            "error": [
                {
                    "value": "-101",
                    "type": "int",
                    "description": "e-mail address doesn't exist"
                },
                {
                    "value": "-102",
                    "type": "int",
                    "description": "wrong password"
                }
            ]
        },
        "description": "login to the system and get user token",
        "act": function (ip, emladdr, pwd, callback) {
            // do login check
            coll.find({
                "emladdr": emladdr
            }, function (err, docs) {
                if (err) {
                    callback(err, null);
                } else {
                    if (docs == null || docs.length == 0) {
                        callback(-101, "e-mail address doesn't exist");
                    } else {
                        var user = docs[0];
                        var retrievedPwd = user.pwd;
                        try {
                            var real_pwd = encoder.decodeRSA(pwd);
                        } catch (err) {
                            callback(err, null);
                            return;
                        }
                        var saltmd5 = encoder.saltMD5(real_pwd);
                        if (retrievedPwd != saltmd5) {
                            callback(-102, "wrong password");
                        } else {
                            // get ip info
                            var req = http.get(config.system.interfaces.ip.url.replace("{$ip}", ip),
                                function (res) {
                                    res.on('data', function (chunk) {
                                        var ipInfo = config.system.interfaces.ip.parse(chunk);
                                        updateToken(ipInfo);
                                    });
                                });
                            req.on("error", function (e) {
                                callback(e, null);
                            });

                            // update token
                            function updateToken(ipInfo) {
                                var removeInUser = [];
                                var removeInToken = [];
                                var removeOutOfDateTokens = function (removeInUser, removeInToken) {
                                    coll.update({
                                        "_id": user._id
                                    }, {
                                        "$pullAll": {
                                            "tokens": removeInUser
                                        }
                                    });
                                    tokenColl.update({
                                            "_id": {
                                                "$in": removeInToken
                                            }
                                        },
                                        {
                                            "$set": {
                                                "deprecated": true
                                            }
                                        }
                                    );
                                };
                                var forEachToken = function (tokens, cursor) {
                                    if (cursor < tokens.length) {
                                        var token_id = tokens[cursor];
                                        tokenColl.find({
                                            "_id": token_id
                                        }, function (err, tokenDocs) {
                                            if (err) {
                                                callback(err, null);
                                                return;
                                            } else {
                                                if (null == tokenDocs || tokenDocs.length == 0) {
                                                    // not found in token, but found in user,
                                                    // remove token in user
                                                    removeInUser.push(user.tokens[i]);
                                                } else {
                                                    var token = tokenDocs[0];
                                                    if (token.deprecated == undefined || token.deprecated == false) {
                                                        // check dead_time
                                                        if (token.dead_time < Date.now()) {
                                                            // dead
                                                            removeInToken.push(token._id);
                                                            removeInUser.push(token._id);
                                                        } else {
                                                            // alive
                                                            if (token.ip_info.country == ipInfo.country
                                                                && token.ip_info.region == ipInfo.region
                                                                && token.ip_info.city == ipInfo.city
                                                                && token.ip_info.ips == ipInfo.ips) {
                                                                // token found
                                                                tokenColl.update({
                                                                    "_id": token._id
                                                                }, {
                                                                    "$set": {
                                                                        "last_visit": Date.now(),
                                                                        "dead_time": (Date.now() + config.token.default_last.parseToSecond() * 1000)
                                                                    }
                                                                });
                                                                callback(false, token.token);
                                                                removeOutOfDateTokens(removeInUser, removeInToken);
                                                                return;
                                                            }
                                                        }
                                                    } else {
                                                        // deprecated token
                                                        removeInUser.push(token_id);
                                                    }
                                                }
                                            }
                                            forEachToken(tokens, cursor + 1);
                                        });
                                    } else {
                                        // iteration finished, target token not found
                                        removeOutOfDateTokens(removeInUser, removeInToken);
                                        var saveToken = function (offset) {
                                            var newToken = {
                                                "token": (encoder.saltMD5(user.emladdr + (Date.now() + offset)))
                                            };
                                            tokenColl.find(newToken, function (err, tmpResult) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    if (tmpResult == null || tmpResult.length == 0) {
                                                        newToken["user"] = user._id;
                                                        newToken["ip_info"] = ipInfo;
                                                        newToken["dead_time"] = (Date.now() + config.token.default_last.parseToSecond() * 1000);
                                                        newToken["last_visit"] = Date.now();
                                                        tokenColl.insert(newToken, {}, function (err, res) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                var token_id = res._id;
                                                                coll.update({
                                                                    "_id": user._id
                                                                }, {
                                                                    "$push": {
                                                                        "tokens": token_id
                                                                    }
                                                                });
                                                                callback(false, res.token);
                                                            }
                                                        });
                                                    } else {
                                                        saveToken(offset + 1);
                                                    }
                                                }
                                            });
                                        };
                                        saveToken(0);
                                    }
                                };
                                forEachToken(user.tokens, 0);
                            }
                        }
                    }
                }
            });
        }
    },
    {
        "name": "register",
        "check": function (condition) {
            return true;
        },
        "method": "register",
        "args": [
            {
                "name": "emladdr",
                "type": "string",
                "description": "e-mail address, which would be your account in this website"
            },
            {
                "name": "pwd",
                "type": "string",
                "description": "password encrypted with given RAS public key. see index for more info",
                "format": "longer than 6 words and contain only english UPPER/down case characters and 0~9"
            }
        ],
        "return": {
            "success": {
                "value": "0",
                "type": "int",
                "description": "succeeded, an email with activation code has sent to your email"
            },
            "error": [
                {
                    "value": "-201",
                    "type": "int",
                    "description": "email address in use"
                },
                {
                    "value": "-202",
                    "type": "int",
                    "description": "invalid email address"
                },
                {
                    "value": "-203",
                    "type": "int",
                    "description": "invalid password"
                }
            ]
        },
        "description": "register a new account",
        "act": function (emladdr, pwd, callback) {
            if (!isEmail(emladdr)) {
                callback(-202, "invalid email address");
                return;
            }
            try {
                var real_pwd = encoder.decodeRSA(pwd);
            } catch (err) {
                callback(err, null);
                return;
            }
            if (!validPwd(real_pwd)) {
                callback(-203, "invalid password");
                return;
            }
            coll.find({
                "emladdr": emladdr
            }, function (err, docs) {
                if (err) {
                    callback(err, null);
                } else {
                    if (docs != null && docs.length != 0) {
                        callback(-201, "email address in use");
                    } else {
                        // check regColl
                        regColl.remove({
                            "dead_time": {
                                "$lt": Date.now()
                            }
                        }, {}, function (err, res) {
                            if (err) {
                                callback(err, null);
                            } else {
                                regColl.find({
                                    "emladdr": emladdr
                                }, function (err, docs) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (docs == null || docs.length == 0) {
                                            // do register
                                            var saltmd5 = encoder.saltMD5(real_pwd);
                                            var activeCode = parseInt(Math.random() * 900000 + 100000);
                                            regColl.insert({
                                                "emladdr": emladdr,
                                                "pwd": saltmd5,
                                                "active_code": activeCode,
                                                "dead_time": Date.now() + config.user.register_verify_time.parseToSecond() * 1000
                                            }, {}, function (err, res) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    callback(false, 0);
                                                    mail(emladdr,
                                                        config.interaction.email.activation.title,
                                                        config.interaction.email.activation.content.replace("{$code}", activeCode)
                                                    );
                                                }
                                            });
                                        } else {
                                            callback(-201, "email address in use");
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });

        }
    },
    {
        "name": "check_token",
        "check": function (condition) {
            return true;
        },
        "method": "check",
        "args": [
            {
                "name": "token",
                "type": "string",
                "description": "token retrieved when logging in"
            }
        ],
        "return": {
            "success": {
                "value": "{$token_state}",
                "type": "object",
                "description": "retrieve designated token state, including info like user_email, token_id, bound_ip, last_visit, dead_time"
            },
            "error": [
                {
                    "value": "-301",
                    "type": "int",
                    "description": "token not found"
                }
            ]
        },
        "act": function (token, callback) {
            tokenColl.find({
                "token": token
            }, function (err, docs) {
                if (err) {
                    callback(err, null);
                } else {
                    if (null == docs || docs.length == 0) {
                        callback(-301, "token not found");
                    } else {
                        var token = docs[0];
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
                                    callback(-301, "token not found");
                                } else {
                                    var user = userDocs[0];
                                    callback(false, {
                                        "user_email": user.emladdr,
                                        "token_id": token.token,
                                        "ip_info": token.ip_info,
                                        "last_visit": new Date(token.last_visit).toLocaleString(),
                                        "dead_time": new Date(token.dead_time).toLocaleString(),
                                        "deprecated": token.deprecated == undefined ? false : token.deprecated
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    },
    {
        "name": "activate_account",
        "check": function (condition) {
            return true;
        },
        "method": "activate",
        "args": [
            {
                "name": "emladdr",
                "type": "string",
                "description": "email address you registered"
            }
        ],
        "return": {
            "success": {
                "value": "0",
                "type": "int",
                "description": "your account has successfully activated"
            },
            "error": [
                {
                    "value": "-401",
                    "type": "int",
                    "description": "cannot find not-activated account with given email address"
                },
                {
                    "value": "-402",
                    "type": "int",
                    "description": "wrong activation code"
                }
            ]
        },
        "act": function (emladdr, code, callback) {
            regColl.find({
                "emladdr": emladdr
            }, function (err, docs) {
                if (err) {
                    callback(err, null);
                } else {
                    if (docs == null || docs.length == 0) {
                        callback(-401, "cannot find not-activated account with given email address");
                    } else {
                        var reg = docs[0];
                        if (reg.active_code == code) {
                            regColl.remove({
                                "_id": reg._id
                            });
                            coll.insert({
                                "emladdr": reg.emladdr,
                                "pwd": reg.pwd,
                                "tokens": [],
                                "auth": []
                            });
                            callback(false, 0);
                        } else {
                            callback(-402, "wrong activation code");
                        }
                    }
                }
            });
        }
    }
];

function Users() {
    this.actions = actions;
    this.check = function (condition) {
        return true;
    }
    this.description = "basic user management";
    this.url = "/users";
}
var users = new Users();
module.exports = users;