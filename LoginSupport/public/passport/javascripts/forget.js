$(document).ready(function () {
    $("#resetbtn").click(function () {
        $("#resetbtn").attr('disabled', true);
        var emladdr = $("#emladdr").val();
        $.ajax({
            url: "../passport_api?lostPWD",
            data: {
                "emladdr": emladdr
            },
            success: function (data) {
                if (data.state == "success") {
                    sweetAlert("New generated password has sent to your email address", "Done!", "success");
                    setTimeout(function () {
                        window.location.href = "?fill_emladdr=" + encodeURI(emladdr);
                    }, 5000);
                } else {
                    sweetAlert(data.res, data.err, "error");
                }
                $("#resetbtn").attr('disabled', false);
            }
        });
    });
    $("#emladdr").keydown(function () {
        if (event.keyCode == 13) {
            setTimeout(function () {
                $("#resetbtn").trigger('click');
            }, 100);
        }
    });
});