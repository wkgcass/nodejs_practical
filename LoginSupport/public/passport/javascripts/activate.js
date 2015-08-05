$(document).ready(function () {
    $("#actbtn").click(function () {
        $("#actbtn").attr('disabled', true);
        var emladdr = $("#emladdr").val();
        var code = $("#code").val();
        $.ajax({
            url: "../passport_api?activate",
            data: {
                "emladdr": emladdr,
                "code": code
            },
            success: function (data) {
                if (data.state == "success") {
                    sweetAlert("You have successfully activated your account", "Done!", "success");
                    setTimeout(function () {
                        window.location.href = "?fill_emladdr=" + encodeURI(emladdr);
                    }, 5000);
                } else {
                    sweetAlert(data.res, data.err, "error");
                }
                $("#actbtn").attr('disabled', false);
            }
        });
    });
    $("#code").keydown(function () {
        if (event.keyCode == 13) {
            $("#actbtn").trigger('click');
        }
    });
});

function resend() {
    var emladdr = $("#emladdr").val();
    if (emladdr == "") {
        sweetAlert("please write your email address in the text field");
        return;
    }
    $.ajax({
        url: "../passport_api?resend",
        data: {
            "emladdr": emladdr
        },
        success: function (data) {
            if (data.state == "success") {
                sweetAlert("Activation code has sent to your email address", "Done!", "success");
            } else {
                sweetAlert(data.res, data.err, "error");
            }
            $("#actbtn").attr('disabled', false);
        }
    });
}