var db = require("./db");
var config = require("../global/config");
var check = require("./check");

var actions = [
    {
        "name": "drop_repository",
        "method": "drop",
        "args": [
            {
                "name": "token",
                "type": "string",
                "description": "token retrieved when logging in"
            }
        ],
        "actions": function (ip, token, rep, callback) {

        }
    }
];