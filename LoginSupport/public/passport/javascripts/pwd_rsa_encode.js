/**
 * Created by wkgcass on 15-8-4.
 */
function pwd_rsa_encode(pwd, callback, baseUrl) {
    if (baseUrl == undefined) {
        baseUrl = "";
    }
    $.ajax({
        url: baseUrl + "../passport_api?getPublicKey",
        success: function (data) {
            if (data.state == "success") {
                var key = data.res;
                var EncryptionResult = cryptico.encrypt(pwd,
                    key
                );
                if (EncryptionResult.status == "success") {
                    callback(false, EncryptionResult.cipher);
                } else {
                    callback(-102, EncryptionResult);
                }
            } else {
                callback(data.err, data.res);
            }
        },
        error: callback
    });
}