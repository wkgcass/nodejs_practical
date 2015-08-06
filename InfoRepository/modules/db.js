var monk = require("monk");
var config = require("../global/config");
var db = monk(config.mongo.url + ":" + config.mongo.port + "/" + config.mongo.db);

module.exports = db;