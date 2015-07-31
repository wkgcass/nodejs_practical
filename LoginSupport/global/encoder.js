var fs = require('fs');
var ursa = require('ursa');
var crypto = require('crypto');
var config = require("./config");

function Encoder() {
    var rsaKey = ursa.createPrivateKey(fs.readFileSync(config.encoding.method.rsa.pri));

    var aesCipher = crypto.createCipheriv(config.encoding.method.aes.algorithm, config.encoding.method.aes.key, "");
    var aesDecipher = crypto.createDecipheriv(config.encoding.method.aes.algorithm, config.encoding.method.aes.key, "");
    this.decodeRSA = function (msg) {
        return rsaKey.decrypt(msg, config.encoding.in_encoding, config.encoding.out_encoding);
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
}

var encoder = new Encoder();

module.exports = encoder;