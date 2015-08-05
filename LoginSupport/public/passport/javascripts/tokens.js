function disable_all() {
    var url = window.location.href;
    url = url.substring(0, url.lastIndexOf("/"));
    url = url.substring(url.lastIndexOf("/") + 1);
    $.ajax({
        "url": "../../passport_api/" + url + "?logoutAll",
        "success": function (data) {
            if (data.state == "success") {
                sweetAlert("All tokens have been disabled", "Done!", "success");
                setTimeout(function () {
                    window.parent.location.href = "../";
                }, 5000);
            } else {
                sweetAlert(data.res, data.err, "error");
            }
        }
    });
}