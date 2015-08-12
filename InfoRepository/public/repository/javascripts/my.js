/**
 * Created by wkgcass on 15-8-12.
 */
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
};
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
};
$(document).ready(function () {
    $("#repCreate").click(function () {
        swal({
            title: "Creating a repository",
            text: "Choose your Repository name...",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "Repository Name"
        }, function (inputValue) {
            if (inputValue === false)
                return false;
            if (inputValue.trim() === "") {
                swal.showInputError("Name should not be empty!");
                return false
            }
            var repNameToCreate = inputValue.trim();
            swal({
                title: "Repository structure",
                text: "the repository structure is like columns of a table. Use ',' to separate columns. You can also leave the structure empty to create a nosql-like repository.",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: "Repository Structure(can be empty)"
            }, function (inputValue) {
                if (inputValue === false)
                    return false;
                var columns;
                if (inputValue.trim() == "") {
                    columns = undefined;
                } else {
                    if (inputValue.indexOf(',') == -1) {
                        columns = inputValue.split("，");
                    } else {
                        columns = inputValue.split(",");
                    }
                    for (var i = 0; i < columns.length; ++i) {
                        columns[i] = columns[i].trim();
                    }
                }
                swal({
                    title: "Repository Encrypt Algorithm",
                    text: "Encrypt Algorithm set for this repository(it's ok, system won't ask for password)\nplain/aes/rsa\nEmpty == plain",
                    type: "input",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    animation: "slide-from-top",
                    inputPlaceholder: "Repository Structure(can be empty)"
                }, function (inputValue) {
                    if (inputValue === false)
                        return false;
                    if (inputValue.trim() === "") {
                        inputValue = "plain";
                    }
                    var algorithm = inputValue.trim();
                    if (algorithm != "plain" && algorithm != "aes" && algorithm != "rsa") {
                        swal.showInputError("illegal encrypt algorithm");
                        return false
                    } else {
                        swal({
                            title: "Check your settings",
                            text: "Name: " + repNameToCreate + ", Structure: " + columns + ", Algorithm: " + inputValue,
                            type: "info",
                            showCancelButton: true,
                            closeOnConfirm: false,
                            showLoaderOnConfirm: true
                        }, function () {
                            $.ajax({
                                "url": "../rep_api/" + getQueryString("token") + "?create",
                                "data": {
                                    "name": repNameToCreate,
                                    "encrypt": algorithm,
                                    "struct": columns,
                                    "is_group": false
                                },
                                "success": function (data) {
                                    if (data.state == "success") {
                                        swal("Done!", "Done!", "success");
                                        setTimeout(function () {
                                            location.reload(true);
                                        }, 5000);
                                    } else {
                                        swal(data.res, data.err, "error");
                                    }
                                }
                            });
                        });
                    }
                });
            });
        });
    });
    $("#grpCreate").click(function () {
        swal({
            title: "Creating a group",
            text: "Choose your Group name...",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "Group Name"
        }, function (inputValue) {
            if (inputValue === false)
                return false;
            if (inputValue === "") {
                swal.showInputError("Name should not be empty!");
                return false
            }
            swal("Nice!", "You wrote: " + inputValue, "success");
        });
    });
});

function jumpRep(rep_id) {
    window.location.href = "rep?rep=" + rep_id + "&token=" + getQueryString("token");
}