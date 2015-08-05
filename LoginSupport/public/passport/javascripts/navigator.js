function dsablecrt() {
    var url = window.location.href;
    url = url.substring(url.lastIndexOf("/") + 1);
    if (url.indexOf("#") == url.length - 1) {
        url = url.substring(0, url.length - 1);
    }

    $.ajax({
        "url": "../passport_api/" + url + "?logout",
        "success": function (data) {
            if (data.state == "success") {
                rmvcky();
            } else {
                sweetAlert(data.res, data.err, "error");
            }
        }
    });
}

function rmvcky() {
    document.cookie = "token=";
    window.location.href = "../passport";
}