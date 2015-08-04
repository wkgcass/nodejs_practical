$(document).ready(function () {
    $("#loginbtn").click(function () {
        $("#loginbtn").attr('disabled', true);
        var emladdr = $("#emladdr").val();
        var plainPWD = $("#pwd").val();
        pwd_rsa_encode(plainPWD, function (err, res) {
            if (err) {
                alert(res);
                $("#loginbtn").attr('disabled', false);
            } else {
                $.ajax({
                    url: "passport_api?login",
                    data: {
                        emladdr: emladdr,
                        pwd: res
                    },
                    "success": function (data) {
                        if (data.state == "success") {
                            window.location.href = "passport/" + data.res;
                        } else {
                            alert(data.res);
                        }
                        $("#loginbtn").attr('disabled', false);
                    }
                })
            }
        });
    });
    $("#pwd").keydown(function () {
        if (event.keyCode == 13) {
            $("#loginbtn").trigger('click');
        }
    });
});