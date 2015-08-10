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
                "url": "http://localhost:3000/passport_api/{$token}/?check&ip={$ip}&refresh=true"
            },
            "emladdr": {
                "url": "http://localhost:3000/passport_api/?getEmladdrById&user_ids={$user_id}"
            }
        }
    }
};