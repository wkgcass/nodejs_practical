var db = require("./modules/db");
/*
 db.get("users").drop();
 db.get("tokens").drop();
 db.get("to_register").drop();
 */

var encoder = require("./global/encoder");
var users = require("./modules/users");

var config = require("./global/config");

var pwdRSA = encoder.encodeRSA("123456");

var login = null;
var register = null;
var check = null;
var activate = null;
for (var i = 0; i < users.actions.length; ++i) {
    if (users.actions[i].name == "login") {
        login = users.actions[i].act;
    } else if (users.actions[i].name == "register") {
        register = users.actions[i].act;
    } else if (users.actions[i].name == "check_token") {
        check = users.actions[i].act;
    } else if (users.actions[i].name == "activate_account") {
        activate = users.actions[i].act;
    }
}

login("180.106.66.201", "wkgcass@hotmail.com", pwdRSA, function (err, res) {
    console.log(err);
    console.log(res);
})