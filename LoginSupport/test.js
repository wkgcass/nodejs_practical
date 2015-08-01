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
var pwdNewRSA = encoder.encodeRSA("567890");

var login = null;
var register = null;
var check = null;
var activate = null;
var change_pwd = null;
var lost_pwd = null;
for (var i = 0; i < users.actions.length; ++i) {
    if (users.actions[i].name == "login") {
        login = users.actions[i].act;
    } else if (users.actions[i].name == "register") {
        register = users.actions[i].act;
    } else if (users.actions[i].name == "check_token") {
        check = users.actions[i].act;
    } else if (users.actions[i].name == "activate_account") {
        activate = users.actions[i].act;
    } else if (users.actions[i].name == "change_pwd") {
        change_pwd = users.actions[i].act;
    } else if (users.actions[i].name == "lost_pwd") {
        lost_pwd = users.actions[i].act;
    }
}
/*
 activate("wkg18@qq.com", "115659", function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
/*
 login("180.106.66.201", "wkg18@qq.com", pwdNewRSA, function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
/*
 check("180.106.66.201", "55165cbd6d69daa6af6eb26ae1b391a3", function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
/*
 change_pwd("180.106.66.201", "52cb7656ccce3c63ea2ce9a2a1991adf", pwdRSA, pwdNewRSA, function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
lost_pwd("wkg18@qq.com", function (err, res) {
    console.log(err);
    console.log(res);
});
