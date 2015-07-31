var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send({
        "available_actions": [
            {
                "name": "login",
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
                "description": "login to the system and get user token"
            },
            {
                "name": "register",
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
                "description": "register a new account"
            },
            {
                "name": "check_token",
                "method": "check",
                "args": [
                    {
                        "name": "token",
                        "type": "string",
                        "description": "token retrieved when logging in"
                    }
                ],
                "return": {
                    "success": {
                        "value": "{$token_state}",
                        "type": "object",
                        "description": "retrieve designated token state, including info like user_name, token_id, last_visit, dead_time"
                    },
                    "error": [
                        {
                            "value": "-301",
                            "type": "int",
                            "description": "token not found"
                        },
                        {
                            "value": "-302",
                            "type": "int",
                            "description": "invalid token"
                        }
                    ]
                }
            }
        ]
    });
});

module.exports = router;
