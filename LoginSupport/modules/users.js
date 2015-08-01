var db = require("./db");
var config = require("../global/config");
var coll = db.get(config.mongo.coll);
var tokenColl = db.get(config.mongo.token_coll);
var regColl = db.get(config.mongo.reg_coll);
var encoder = require("../global/encoder");
var ipcheck = require("./ipcheck");
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
                            ipcheck(ip, function (err, ipInfo) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    // update token
                                    var removeInToken = [];
                                    var removeOutOfDateTokens = function (removeInToken) {
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
                                        if (tokens != null && cursor < tokens.length) {
                                            var token = tokens[cursor];
                                            // check dead_time
                                            if (token.dead_time < Date.now()) {
                                                // dead
                                                removeInToken.push(token._id);
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
                                                    removeOutOfDateTokens(removeInToken);
                                                    return;
                                                }
                                            }
                                            forEachToken(tokens, cursor + 1);
                                        } else {
                                            // iteration finished, target token not found
                                            removeOutOfDateTokens(removeInToken);
                                            var saveToken = function (offset) {
                                                var newToken = {
                                                    "token": (encoder.saltMD5(user.emladdr + (Date.now() + offset))),
                                                    "deprecated": false
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
                                    tokenColl.find({
                                        "user": user._id,
                                        "deprecated": false
                                    }, {}, function (err, tokenDocs) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            forEachToken(tokenDocs, 0);
                                        }
                                    });
                                }
                            });
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
            "error": []
        },
        "act": function (ip, token, callback) {
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
                                    && ipInfo.ips == token.ip_info.ips
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
                                                callback(false, {
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
                                    callback(101, "token not found");
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
                                "pwd": reg.pwd
                            });
                            callback(false, 0);
                        } else {
                            callback(-402, "wrong activation code");
                        }
                    }
                }
            });
        }
    },
    {
        "name": "change_pwd",
        "check": function (condition) {
            return true;
        },
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
    },
    {
        "name": "lost_pwd",
        "check": function (condition) {
            return true;
        },
        "method": "lostPWD",
        "args": [
            {
                "name": "emladdr",
                "type": "string",
                "description": "your account, of which password you forgot"
            }
        ],
        "return": {
            "success": {
                "value": "0",
                "type": "int",
                "description": "an email containing password generated by system has successfully sent to your address"
            },
            "error": [
                {
                    "value": "-601",
                    "type": "int",
                    "description": "account doesn't exist"
                }
            ]
        },
        "act": function (emladdr, callback) {
            coll.find({
                "emladdr": emladdr
            }, function (err, docs) {
                if (err) {
                    callback(err, null);
                } else {
                    if (docs == null || docs.length == 0) {
                        callback(-601, "account doesn't exist");
                    } else {
                        var user = docs[0];
                        var pwd = "";
                        var len = 16;
                        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
                        var maxPos = $chars.length;
                        for (var i = 0; i < len; i++) {
                            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
                        }
                        coll.update({
                            "_id": user._id
                        }, {
                            "$set": {
                                "pwd": encoder.saltMD5(pwd)
                            }
                        });
                        tokenColl.update({
                            "user": user._id,
                            "deprecated": false
                        }, {
                            "$set": {
                                "deprecated": true
                            }
                        });
                        mail(user.emladdr,
                            config.interaction.email.lost_pwd.title,
                            config.interaction.email.lost_pwd.content.replace("{$pwd}", pwd),
                            function (err, res) {
                                if (err) {
                                    callback(err, res);
                                } else {
                                    callback(false, 0);
                                }
                            });
                    }
                }
            });
        }
    },
    {
        "name": "logout",
        "check": function (condition) {
            return true;
        },
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
                    if (isDeprecated(token)) {
                        callback(102, "token is deprecated");
                    } else {
                        ipcheck(ip, function (err, ipInfo) {
                            if (ipInfo.country == tok.ip_info.country
                                && ipInfo.region == tok.ip_info.region
                                && ipInfo.city == tok.ip_info.city
                                && ipInfo.isp == tok.ip_info.isp
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
        "check": function (condition) {
            return true;
        },
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
                    if (isDeprecated(token)) {
                        callback(102, "token is deprecated");
                    } else {
                        ipcheck(ip, function (err, ipInfo) {
                            if (ipInfo.country == tok.ip_info.country
                                && ipInfo.region == tok.ip_info.region
                                && ipInfo.city == tok.ip_info.city
                                && ipInfo.isp == tok.ip_info.isp
                                ) {
                                callback(false, 0);
                                tokenColl.update({
                                    "user": tok.user,
                                    "deprecated": false
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