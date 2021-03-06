var http = require("http");
var config = require("../global/config");

module.exports = function (user_ids, callback) {
    if (user_ids.length == 0) {
        callback(false, {});
        return;
    }
    var req = http.get(config.system.interfaces.emladdr.url.replace("{$user_id}", encodeURI(JSON.stringify({"arr": user_ids}))),
        function (res) {
            res.on('data', function (chunk) {
                var json = JSON.parse(chunk);
                if (json.state == "error") {
                    callback(json.err, json.res);
                } else {
                    callback(false, json.res);
                }
            });
        });
    req.on("error", function (e) {
        callback(e, null);
    });
};