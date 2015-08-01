var http = require("http");
var config = require("../global/config");

module.exports = function (ip, callback) {
    var req = http.get(config.system.interfaces.ip.url.replace("{$ip}", ip),
        function (res) {
            res.on('data', function (chunk) {
                var ipInfo = config.system.interfaces.ip.parse(chunk);
                callback(false, ipInfo);
            });
        });
    req.on("error", function (e) {
        callback(e, null);
    });
};