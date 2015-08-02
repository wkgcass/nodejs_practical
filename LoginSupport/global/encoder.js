var fs = require('fs');
var ursa = require('ursa');
var crypto = require('crypto');
var config = require("./config");

function Encoder() {
    var rsaKey = ursa.createPrivateKey(fs.readFileSync(config.system.root_path + config.encoding.method.rsa.pri));
    var rsaPubKey = ursa.createPublicKey(fs.readFileSync(config.system.root_path + config.encoding.method.rsa.pub));

    var aesCipher = crypto.createCipheriv(config.encoding.method.aes.algorithm, config.encoding.method.aes.key, "");
    var aesDecipher = crypto.createDecipheriv(config.encoding.method.aes.algorithm, config.encoding.method.aes.key, "");
    this.decodeRSA = function (msg) {
        return rsaKey.decrypt(msg, config.encoding.in_encoding, config.encoding.out_encoding);
    }
    this.encodeRSA = function (msg) {
        return rsaPubKey.encrypt(msg, config.encoding.out_encoding, config.encoding.in_encoding);
    }
    this.decodeAES = function (toDecode) {
        var plainChunks = [];
        plainChunks.push(aesDecipher.update(toDecode, config.encoding.in_encoding, config.encoding.out_encoding));
        //plainChunks.push(aesDecipher.final(config.encoding.out_encoding));
        return plainChunks.join('');
    }
    this.encodeAES = function (msg) {
        var cipherChunks = [];
        cipherChunks.push(aesCipher.update(msg, config.encoding.out_encoding, config.encoding.in_encoding));
        cipherChunks.push(aesCipher.final(config.encoding.in_encoding));
        return cipherChunks.join('');
    }
    this.saltMD5 = function (msg) {
        var md5 = crypto.createHash('md5');
        var md5_2 = crypto.createHash('md5');
        md5_2.update(msg);
        var first = md5_2.digest('hex');
        md5.update(config.encoding.method.md5.prefix_salt + first + config.encoding.method.md5.suffix_salt);
        return md5.digest('hex');
    }
}

var encoder = new Encoder();

module.exports = encoder;