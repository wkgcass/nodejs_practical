$(document).ready(function () {
    $("#actbtn").click(function () {
        $("#actbtn").attr('disabled', true);
        var emladdr = $("#emladdr").val();
        var code = $("#code").val();
        $.ajax({
            url: "passport_api?activate",
            data: {
                "emladdr": emladdr,
                "code": code
            },
            success: function (data) {
                if (data.state == "success") {
                    alert("Done!");
                    window.location.href = "?fill_emladdr=" + encodeURI(emladdr);
                } else {
                    alert(data.res);
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
        alert("please write your email address in the text field");
        return;
    }
    $.ajax({
        url: "passport_api?resend",
        data: {
            "emladdr": emladdr
        },
        success: function (data) {
            if (data.state == "success") {
                alert("Done!");
            } else {
                alert(data.res);
            }
            $("#actbtn").attr('disabled', false);
        }
    });
}