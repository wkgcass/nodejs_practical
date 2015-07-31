module.exports = {
    "mongo": {
        "url": "localhost:27017",
        "db": "users",
        "coll": "users"
    },
    "token": {
        "default_last": {
            "years": 0,
            "months": 0,
            "days": 30,
            "hours": 0,
            "minutes": 0,
            "seconds": 0
        },
        "components": {
            "token_id": 32,
            "verifier": 32
        }
    },
    "encoding": {
        "in_encoding": "base64",
        "out_encoding": "utf8",
        "method": {
            "rsa": {
                "pub": "./keys/public_key.pem",
                "pri": "./keys/private_key.pem"
            },
            "aes": {
                "algorithm": "aes-128-ecb",
                "key": "J90kd90J0wEj7oj2"
            }
        }
    },
    "system": {
        "direct_ip": [
            "localhost"
        ],
        "requests": {
            "max_charge": 3,
            "cool_down": 30,
            "lock": 5
        },
        "interfaces": {
            "ip": {
                "url": "http://ip.taobao.com/service/getIpInfo.php?ip={$ip}",
                "parse": function (res) {
                    var resObj = JSON.parse(res);
                    if (resObj.code == 0) {
                        return {
                            "country": resObj.data.country,
                            "region": resObj.data.region,
                            "city": resObj.data.city
                        };
                    } else {
                        return {
                            "country": "unknown",
                            "region": "unknown",
                            "city": "unknown"
                        };
                    }
                }
            }
        }
    }
};