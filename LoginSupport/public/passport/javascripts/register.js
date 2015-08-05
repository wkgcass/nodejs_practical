$(document).ready(function () {
    $("#regbtn").click(function () {
        $("#regbtn").attr('disabled', true);
        var emladdr = $("#emladdr").val();
        var pwd = $("#pwd").val();
        var rpwd = $("#rpwd").val();
        var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        if (!reg.test(emladdr)) {
            sweetAlert("invalid email address", "Error", "error");
            return;
        }
        if (pwd != rpwd) {
            sweetAlert("passwords should be the same", "Error", "error");
            return;
        }
        var regPWD = /^[a-z0-9]+$/i;
        if (!regPWD.test(rpwd)) {
            sweetAlert("invalid password", "Error", "error");
            return;
        }
        pwd_rsa_encode(rpwd, function (err, res) {
            if (err) {
                sweetAlert(res, err, "error");
                $("#regbtn").attr('disabled', false);
            } else {
                $.ajax({
                    "url": "../passport_api?register",
                    "data": {
                        "emladdr": emladdr,
                        "pwd": res
                    },
                    "success": function (data) {
                        if (data.state == "success") {
                            sweetAlert("Done!", "Done!", "success");
                            setTimeout(function () {
                                window.location.href = "?activate&fill_emladdr=" + encodeURI(emladdr);
                            }, 5000);
                        } else {
                            sweetAlert(data.res, data.err, "error");
                            $("#regbtn").attr('disabled', false);
                        }
                    }
                });
            }
        });
    });
    $("#rpwd").keydown(function () {
        if (event.keyCode == 13) {
            $("#regbtn").trigger('click');
        }
    });
});