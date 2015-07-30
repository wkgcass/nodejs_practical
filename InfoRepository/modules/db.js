var monk = require("monk");
var db = monk("localhost:27017/nodetest");

module.exports = db;