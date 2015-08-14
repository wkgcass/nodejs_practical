module.exports = {
    "mongo": {
        "url": "localhost:27017",
        "db": "info",
        "coll": {
            "repository": "repository",
            "record": "record",
            "group": "group"
        }
    },
    "system": {
        "interfaces": {
            "user": {
                "url": "http://api.passport.cassite.net/{$token}/?check&ip={$ip}&refresh=true"
            },
            "emladdr": {
                "url": "http://api.passport.cassite.net/?getEmladdrById&user_ids={$user_id}"
            }
        }
    }
};