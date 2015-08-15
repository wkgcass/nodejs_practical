var fs = require("fs");
var config = require("./config");

var mds = {};
var last = [];
var nextCheck = 0;

module.exports = function (dir, blog) {
    if (nextCheck < (new Date()).getTime()) {
        // do check
        var files = fs.readdirSync(config.dir);
        files.forEach(function (d) {
            var inFiles = fs.readdirSync(config.dir + config.separator + d);
            inFiles.forEach(function (f) {
                var path = config.dir + config.separator + d + config.separator + f;
                var stat = fs.statSync(path);
                if (mds[d] == undefined || mds[d][f] == undefined || mds[d][f].mtime.getTime() < stat.mtime.getTime()) {
                    // do refresh
                    var content = fs.readFileSync(path, 'utf-8');
                    if (mds[d] == undefined) {
                        mds[d] = {};
                    }
                    mds[d][f] = {
                        "title": f.substr(0, f.length - config.suffix.length),
                        "content": content,
                        "mtime": stat.mtime,
                        "ctime": stat.ctime
                    };
                }
            });
        });
        nextCheck = (new Date()).getTime() + config.checking_interval;
    }

    return mds[dir] == undefined ? undefined : mds[dir][blog];
};