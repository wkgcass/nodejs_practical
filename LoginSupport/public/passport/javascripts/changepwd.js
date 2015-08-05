/**
 * Created by wkgcass on 15-8-4.
 */
$(document).ready(function () {
    $("#changebtn").click(function () {
        var url = window.location.href;
        url = url.substring(0, url.lastIndexOf("/"));
        url = url.substring(url.lastIndexOf("/") + 1);

        var opwd = $("#opwd").val();
        var npwd = $("#npwd").val();
        var rnpwd = $("#rnpwd").val();
        if (npwd != rnpwd) {
            sweetAlert("passwords should be the same", "Error", "error");
            return;
        }
        var regPWD = /^[a-z0-9]+$/i;
        if (!regPWD.test(rnpwd)) {
            sweetAlert("invalid password", "Error", "error");
            return;
        }
        $("#changebtn").attr('disabled', true);
        pwd_rsa_encode(rnpwd, function (err, res) { // new password
            if (err) {
                sweetAlert(res, err, "error");
                $("#changebtn").attr('disabled', false);
            } else {
                pwd_rsa_encode(opwd, function (err, res2) { // original password
                    if (err) {
                        sweetAlert(res2, err, "error");
                        $("#changebtn").attr('disabled', false);
                    } else {
                        $.ajax({
                            "url": "../../passport_api/" + url + "?changePWD",
                            "data": {
                                "opwd": res2,
                                "npwd": res
                            },
                            "success": function (data) {
                                if (data.state == "success") {
                                    sweetAlert("Password has changed!", "Done!", "success");
                                    setTimeout(function () {
                                        window.parent.location.href = "../";
                                    }, 5000);
                                } else {
                                    sweetAlert(data.res, data.err, "error");
                                    $("#changebtn").attr('disabled', false);
                                }
                            }
                        });
                    }
                }, "../../../");
            }
        }, "../../../");
    });
    $("#opwd,#npwd,#rnpwd").keydown(function () {
        if (event.keyCode == 13) {
            setTimeout(function () {
                $("#changebtn").trigger('click');
            }, 100);
        }
    });
});