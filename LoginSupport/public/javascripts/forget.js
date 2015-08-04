$(document).ready(function () {
    $("#resetbtn").click(function () {
        $("#resetbtn").attr('disabled', true);
        var emladdr = $("#emladdr").val();
        $.ajax({
            url: "passport_api?lostPWD",
            data: {
                "emladdr": emladdr
            },
            success: function (data) {
                if (data.state == "success") {
                    alert("Done!");
                    window.location.href = "?fill_emladdr=" + encodeURI(emladdr);
                } else {
                    alert(data.res);
                }
                $("#resetbtn").attr('disabled', false);
            }
        });
    });
    $("#emladdr").keydown(function () {
        if (event.keyCode == 13) {
            $("#resetbtn").trigger('click');
        }
    });
});