var crypto = require('crypto');
var config = require("./config");
var rsa = require("./rsa");

function Encoder() {
    var key = rsa.generate();
    this.getKey = function () {
        return key.str;
    };
    this.decodeRSA = function (msg) {
        var callbk = rsa.decode(key.key, msg);
        if (callbk.err) {
            throw callbk.err;
        } else {
            return callbk.res;
        }
    };
    this.encodeRSA = function (msg) {
        var callbk = rsa.encode(key.key, msg);
        if (callbk.err) {
            throw callbk.err;
        } else {
            return callbk.res;
        }
    };
    this.saltMD5 = function (msg) {
        var md5 = crypto.createHash('md5');
        var md5_2 = crypto.createHash('md5');
        md5_2.update(msg);
        var first = md5_2.digest('hex');
        md5.update(config.encoding.method.md5.prefix_salt + first + config.encoding.method.md5.suffix_salt);
        return md5.digest('hex');
    };
}

var encoder = new Encoder();

module.exports = encoder;