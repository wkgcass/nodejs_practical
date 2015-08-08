module.exports = {
    "mongo": {
        "url": "localhost",
        "port": 27017,
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
                "url": "localhost:3000/passport/{$token}/?check&ip={$ip}&refresh=true"
            },
            "emladdr": {
                "url": "localhost:3000/passport/?getEmladdrById&user_ids={$user_id}"
            }
        }
    }
};