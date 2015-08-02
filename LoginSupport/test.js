var db = require("./modules/db");
/*
 db.get("passport").drop();
 db.get("tokens").drop();
 db.get("to_register").drop();
 */
var encoder = require("./global/encoder");
var users = require("./modules/passport");

var config = require("./global/config");

var pwdRSA = encoder.encodeRSA("123456");
var pwdNewRSA = encoder.encodeRSA("567890");
var pwdGen = encoder.encodeRSA("XffS7Zni7jHpSAAd");

var login = null;
var register = null;
var check = null;
var activate = null;
var change_pwd = null;
var lost_pwd = null;
var resend = null;
var logoutAll = null;
var logout = null;
for (var i = 0; i < passport.actions.length; ++i) {
    if (passport.actions[i].name == "login") {
        login = passport.actions[i].act;
    } else if (passport.actions[i].name == "register") {
        register = passport.actions[i].act;
    } else if (passport.actions[i].name == "check_token") {
        check = passport.actions[i].act;
    } else if (passport.actions[i].name == "activate_account") {
        activate = passport.actions[i].act;
    } else if (passport.actions[i].name == "change_pwd") {
        change_pwd = passport.actions[i].act;
    } else if (passport.actions[i].name == "lost_pwd") {
        lost_pwd = passport.actions[i].act;
    } else if (passport.actions[i].name == "resend") {
        resend = passport.actions[i].act;
    } else if (passport.actions[i].name == "logout_all") {
        logoutAll = passport.actions[i].act;
    } else if (passport.actions[i].name == "logout") {
        logout = passport.actions[i].act;
    }
}

/*
 register("wkg18@qq.com", pwdRSA, function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
/*
 resend("wkg18@qq.com", function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
/*
 activate("wkg18@qq.com", "103316", function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
/*
 login("180.106.66.201", "wkg18@qq.com", pwdGen, function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
/*
 check("180.106.66.201", "070e53105a06d7d3484cdf74c4b04bfe", function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
/*
 change_pwd("180.106.66.201", "3f5221f929302fce032b0ea28068b90f", pwdRSA, pwdNewRSA, function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
/*
 lost_pwd("180.106.66.201", "wkg18@qq.com", function (err, res) {
 console.log(err);
 console.log(res);
 });
 */
/*
 logoutAll("180.106.66.201", "070e53105a06d7d3484cdf74c4b04bfe", function (err, res) {
 console.log(err);
 console.log(res);
 });
 */