var fs = require("fs");
var config = require("./config");
var qsort = require("./qsort");
var md = require("markdown").markdown;

var mds = {};
var all = [];
var nextCheck = 0;

var toExport = {
    "refresh": function () {
        if (nextCheck < (new Date()).getTime()) {
            // do check
            var files = fs.readdirSync(config.dir);
            files.forEach(function (d) {
                var inFiles = fs.readdirSync(config.dir + config.separator + d);
                inFiles.forEach(function (f) {
                    if (f.indexOf(".") == 0) return;
                    var fname = f.substr(0, f.length - config.suffix.length);
                    var path = config.dir + config.separator + d + config.separator + f;
                    var stat = fs.statSync(path);

                    var doRefresh = function (path, cat, name, arr, index) {
                        var content = fs.readFileSync(path, 'utf-8');
                        var htmlContent = md.toHTML(content);
                        var toPush = {
                            "title": name,
                            "cat": cat,
                            "preview": htmlContent.replace(/<[^>]*>/g, "").substr(0, config.preview_words),
                            "content": htmlContent,
                            "mtime": stat.mtime.getTime(),
                            "ctime": stat.ctime.getTime()
                        };
                        if (index < 0) {
                            arr.push(toPush);
                        }
                        arr[index] = toPush;
                        var notFound = true;
                        for (var i = 0; i < all.length; ++i) {
                            if (all[i].title == name && all[i].cat == arr[index].cat) {
                                all[i] = arr[index];
                                notFound = false;
                                break;
                            }
                        }
                        if (notFound) {
                            all.push(arr[index]);
                        }
                    };

                    if (mds[d] == undefined) {
                        // not found
                        mds[d] = [];
                        // do refresh
                        doRefresh(path, d, fname, mds[d], -1);
                    } else {
                        var index = -1;
                        for (var i = 0; i < mds[d].length; ++i) {
                            if (mds[d][i].title == fname) {
                                index = i;
                                break;
                            }
                        }
                        if (-1 == index || mds[d][index].mtime < stat.mtime.getTime()) {
                            // do refresh
                            doRefresh(path, d, fname, mds[d], index);
                        }
                    }
                });
            });
            nextCheck = (new Date()).getTime() + config.checking_interval;

            for (var key in mds) {
                mds[key] = qsort.sortObj(mds[key], 'mtime', 'desc');
            }

            all = qsort.sortObj(all, 'mtime', 'desc');
        }
    },
    "getOne": function (cat, title) {
        toExport.refresh();
        if (mds[cat] == undefined) {
            return undefined;
        } else {
            for (var i = 0; i < mds[cat].length; ++i) {
                if (mds[cat][i].title == title) {
                    return mds[cat][i];
                }
            }
            return undefined;
        }
    },
    "getByCat": function (cat, start, count) {
        toExport.refresh();
        var toReturn = [];
        if (mds[cat] == undefined) {
            return undefined;
        } else {
            for (var i = start; i < start + count && i < mds[cat].length; ++i) {
                toReturn.push(mds[cat][i]);
            }
        }
        return toReturn;
    },
    "getAll": function (start, count) {
        toExport.refresh();
        var toReturn = [];
        for (var i = start; i < start + count && i < all.length; ++i) {
            toReturn.push(all[i]);
        }
        return toReturn;
    },
    "getCats": function () {
        toExport.refresh();
        var toReturn = [];
        for (var key in mds) {
            toReturn.push(key);
        }
        return toReturn;
    }
};

module.exports = toExport;