var actions = [
    {
        "name": "login",
        "check": function (condition) {
            return true;
        },
        "method": "login",
        "args": [
            {
                "name": "emladdr",
                "type": "string",
                "description": "e-mail address"
            },
            {
                "name": "pwd",
                "type": "string",
                "description": "password encrypted with given RAS public key. see index for more info"
            }
        ],
        "return": {
            "success": {
                "value": "{$token}",
                "type": "string",
                "description": "user token"
            }
        },
        "description": "login to the system and get user token",
        "act": function (emladdr, pwd) {
            // TODO
        }
    },
    {
        "name": "register",
        "check": function (condition) {
            return true;
        },
        "method": "register",
        "args": [
            {
                "name": "emladdr",
                "type": "string",
                "description": "e-mail address, which would be your account in this website"
            },
            {
                "name": "pwd",
                "type": "string",
                "description": "password encrypted with given RAS public key. see index for more info",
                "format": "longer than 6 words and contain only english UPPER/down case characters and 0~9"
            }
        ],
        "return": {
            "success": {
                "value": "0",
                "type": "int",
                "description": "succeeded"
            },
            "error": [
                {
                    "value": "-201",
                    "type": "int",
                    "description": "email address in use"
                },
                {
                    "value": "-202",
                    "type": "int",
                    "description": "invalid email address"
                },
                {
                    "value": "-203",
                    "type": "string",
                    "description": "invalid password"
                }
            ]
        },
        "description": "register a new account",
        "act": function (emladdr, pwd) {
            // TODO
        }
    }
];

function Users() {
    this.actions = actions;
    this.check = function (condition) {
        return true;
    }
    this.description = "basic user management";
    this.url = "/users";
}
var users = new Users();
module.exports = users;