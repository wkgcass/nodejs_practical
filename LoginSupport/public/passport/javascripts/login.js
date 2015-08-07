$(document).ready(function () {
    $("#loginbtn").click(function () {
        $("#loginbtn").attr('disabled', true);
        var emladdr = $("#emladdr").val();
        var plainPWD = $("#pwd").val();
        pwd_rsa_encode(plainPWD, function (err, res) {
            if (err) {
                $("#loginbtn").attr('disabled', false);
            } else {
                $.ajax({
                    url: "../passport_api?login",
                    data: {
                        emladdr: emladdr,
                        pwd: res
                    },
                    "success": function (data) {
                        if (data.state == "success") {
                            if ($("#do_cookie").is(':checked')) {
                                var exdate = new Date();
                                exdate.setDate(exdate.getDate() + 30);
                                document.cookie = "token=" + data.res + ";expires=" + exdate.toGMTString() + ";path=/";
                            } else {
                                document.cookie = "token=" + data.res + ";path=/";
                            }
                            window.location.href = data.res;
                        } else {
                            sweetAlert(data.res, data.err, "error");
                        }
                        $("#loginbtn").attr('disabled', false);
                    }
                })
            }
        });
    });
    $("#emladdr,#pwd").keydown(function () {
        if (event.keyCode == 13) {
            setTimeout(function () {
                $("#loginbtn").trigger('click');
            }, 100);
        }
    });
});