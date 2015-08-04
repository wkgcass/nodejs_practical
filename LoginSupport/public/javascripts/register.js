$(document).ready(function () {
    $("#regbtn").click(function () {
        $("#regbtn").attr('disabled', true);
        var emladdr = $("#emladdr").val();
        var pwd = $("#pwd").val();
        var rpwd = $("#rpwd").val();
        var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        if (!reg.test(emladdr)) {
            alert("invalid email address");
            return;
        }
        if (pwd != rpwd) {
            alert("passwords should be the same");
            return;
        }
        var regPWD = /^[a-z0-9]+$/i;
        if (!regPWD.test(rpwd)) {
            alert("invalid password");
            return;
        }
        pwd_rsa_encode(rpwd, function (err, res) {
            if (err) {
                alert(res);
                $("#regbtn").attr('disabled', false);
            } else {
                $.ajax({
                    "url": "passport_api?register",
                    "data": {
                        "emladdr": emladdr,
                        "pwd": res
                    },
                    "success": function (data) {
                        if (data.state == "success") {
                            alert("Done!");
                            window.location.href = "?activate&fill_emladdr=" + encodeURI(emladdr);
                        } else {
                            alert(data.res);
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