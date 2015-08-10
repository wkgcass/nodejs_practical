/**
 * Created by wkgcass on 15-8-10.
 */

var token = null;
$(document).ready(function () {
    $.ajax({
        "url": "http://localhost:3000/passport/",
        "data": {
            cookieCheck: ""
        },
        "async": false,
        "dataType": "jsonp",
        "success": function (res) {
            if (res.state == "success") {
                // show the hiddenUser div
                $("#hiddenUser").show();
                $("#user").hide();
                token = res.res;
            }
        }
    });

    $("#toCenter").click(function () {
        if (token != null) {
            window.open('http://localhost:3000/passport/' + token);
        }
    });
});