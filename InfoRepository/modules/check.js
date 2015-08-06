var http = require("http");
var config = require("../global/config");

module.exports = function (ip, token, callback) {
    var req = http.get(config.system.interfaces.user.url.replace("{$token}", token).replace("{$ip}", ip),
        function (res) {
            res.on('data', function (chunk) {
                var json = JSON.parse(chunk);
                if (json.state == "error") {
                    callback(json.err, json.res);
                } else if (json.res.deprecated) {
                    callback(102, "token is deprecated")
                } else {
                    callback(false, json);
                }
            });
        });
    req.on("error", function (e) {
        callback(e, null);
    });
};