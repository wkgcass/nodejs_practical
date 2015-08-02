var http = require("http");
var config = require("../global/config");

module.exports = function (ip, callback) {
    for (var i = 0; i < config.system.direct_ip.length; ++i) {
        if (config.system.direct_ip[i] == ip) {
            callback(false, {
                "country": "中国",
                "region": "江苏省",
                "city": "苏州市"
            });
            return;
        }
    }
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