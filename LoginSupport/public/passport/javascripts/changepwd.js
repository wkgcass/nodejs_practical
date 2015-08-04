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
            alert("passwords should be the same");
            return;
        }
        var regPWD = /^[a-z0-9]+$/i;
        if (!regPWD.test(rnpwd)) {
            alert("invalid password");
            return;
        }
        $("#changebtn").attr('disabled', true);
        pwd_rsa_encode(rnpwd, function (err, res) { // new password
            if (err) {
                alert(res);
                $("#changebtn").attr('disabled', false);
            } else {
                pwd_rsa_encode(opwd, function (err, res2) { // original password
                    if (err) {
                        alert(res2);
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
                                    alert("Done!");
                                    window.parent.location.href = "../";
                                } else {
                                    alert(data.res);
                                    $("#changebtn").attr('disabled', false);
                                }
                            }
                        });
                    }
                }, "../../../");
            }
        }, "../../../");
    });
    $("#rnpwd").keydown(function () {
        if (event.keyCode == 13) {
            $("#regbtn").trigger('click');
        }
    });
});