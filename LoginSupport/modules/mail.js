var mail = require("nodemailer");
var config = require("../global/config");
var smtp = mail.createTransport(config.system.interfaces.email.method, {
    "name": config.system.website_name,
    "service": config.system.interfaces.email.service,
    "auth": {
        "user": config.system.interfaces.email.account,
        "pass": config.system.interfaces.email.password
    }
});

module.exports = function (to, subject, content, callback) {
    smtp.sendMail({
        "from": config.system.interfaces.email.account,
        "to": to,
        "subject": subject,
        "html": content
    }, callback);
}