var mail = require("nodemailer");
var config = require("../global/config");
var db = require("./db");
var mailColl = db.get(config.mongo.mail);

var smtp = mail.createTransport(config.system.interfaces.email.method, {
    "name": config.system.website_name,
    "service": config.system.interfaces.email.service,
    "auth": {
        "user": config.system.interfaces.email.account,
        "pass": config.system.interfaces.email.password
    }
});

function doSend(mailDoc, to, subject, content, callback) {
    smtp.sendMail({
        "from": config.system.interfaces.email.account,
        "to": to,
        "subject": subject,
        "html": content
    }, function (err, res) {
        if (err) {
        } else {
            mailColl.update({
                "_id": mailDoc._id
            }, {
                "$set": {
                    "dead_time": (Date.now() + config.user.email_interval.parseToSecond() * 1000)
                }
            });
        }
        if (callback != undefined) {
            callback(err, res);
        }
    });
}

module.exports = function (to, subject, content, callback) {
    mailColl.find({
        "to": to
    }, function (err, docs) {
        if (err) {
            if (callback != undefined) {
                callback(err, null);
            }
        } else {
            if (docs == null || docs.length == 0) {
                // insert
                var doc = {
                    "to": to,
                    "dead_time": 0
                };
                mailColl.insert(doc, function (err, res) {
                    if (err) {
                        if (callback != undefined) {
                            callback(err, res);
                        }
                    } else {
                        doSend(res, to, subject, content, callback);
                    }
                });
            } else {
                var mailDoc = docs[0];
                if (mailDoc.dead_time > Date.now()) {
                    if (callback != undefined) {
                        callback(201, "email sending interval");
                    }
                } else {
                    doSend(mailDoc, to, subject, content, callback);
                }
            }
        }
    });
};