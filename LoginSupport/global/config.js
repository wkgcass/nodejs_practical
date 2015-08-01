var config = {
    "mongo": {
        "url": "localhost:27017",
        "db": "users",
        "coll": "users",
        "token_coll": "tokens",
        "reg_coll": "to_register"
    },
    "user": {
        "register_verify_time": {
            "days": 30,
            "hours": 0,
            "minutes": 0,
            "seconds": 0,
            "parseToSecond": function () {
                var last = config.user.register_verify_time;
                return last.days * 86400 + last.hours * 3600 + last.minutes * 60 + last.seconds;
            }
        },
        "verify_email_interval": {
            "days": 0,
            "hours": 0,
            "minutes": 3,
            "seconds": 0,
            "parseToSecond": function () {
                var last = config.user.verify_email_interval;
                return last.days * 86400 + last.hours * 3600 + last.minutes * 60 + last.seconds;
            }
        }
    },
    "token": {
        "default_last": {
            "days": 30,
            "hours": 0,
            "minutes": 0,
            "seconds": 0,
            "parseToSecond": function () {
                var last = config.token.default_last;
                return last.days * 86400 + last.hours * 3600 + last.minutes * 60 + last.seconds;
            }
        }
    },
    "encoding": {
        "in_encoding": "base64",
        "out_encoding": "utf8",
        "method": {
            "rsa": {
                "pub": "/global/public_key.pem",
                "pri": "/global/private_key.pem"
            },
            "aes": {
                "algorithm": "aes-128-ecb",
                "key": "J90kd90J0wEj7oj2"
            },
            "md5": {
                "prefix_salt": "91wE",
                "suffix_salt": "7Dc3"
            }
        }
    },
    "system": {
        "website_name": "Cass Coding",
        "root_path": "/Volumes/PROJECTS/git/nodejs/nodejs_practical/LoginSupport",
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
                    if (null == res || undefined == res) {
                        return {
                            "country": "unknown",
                            "region": "unknown",
                            "city": "unknown",
                            "isp": "unknown"
                        };
                    }
                    if (resObj.code == 0) {
                        return {
                            "country": (resObj.data.country == "" ? "unknown" : resObj.data.country),
                            "region": (resObj.data.region == "" ? "unknown" : resObj.data.region),
                            "city": (resObj.data.city == "" ? "unknown" : resObj.data.city),
                            "ips": (resObj.data.isp == "" ? "unknown" : resObj.data.isp)
                        };
                    } else {
                        return {
                            "country": "unknown",
                            "region": "unknown",
                            "city": "unknown",
                            "isp": "unknown"
                        };
                    }
                }
            },
            "email": {
                "account": "wkgcass@hotmail.com",
                "password": "wkg951018",
                "method": "SMTP",
                "service": "hotmail"
            }
        }
    },
    "interaction": {
        "email": {
            "activation": {
                "title": "[Activation Code] From Cass Site, please verify your account as soon as possible",
                "content": "Thank you for signing up in my site, here's only one step before you can enjoy yourself there,<br/>" +
                    "Please verify your account with <b>{$code}</b>, instructions can be found at '/user' page.<br/>" +
                    "Thanks for your cooperation.<br/><br/>" +
                    "Cass Site is a personal site run by wkgcass, If you have any comments or suggestions, feel free to contact me by replying this email or leaving your precious comments on my site.<br/>"
            }
        }
    }
};

module.exports = config;