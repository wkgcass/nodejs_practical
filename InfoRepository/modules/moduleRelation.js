var mapping = {
    "root": {
        "module": "./root",
        "children": {
            "users": {
                "module": "./users",
                "children": {
                    "current_user": {
                        "module": "./users/current"
                    },
                    "designated_user": {
                        "module": "./users/designated"
                    }
                }
            }
        }
    }
};

function Relation(mapping) {
    var privateFindChildren = function (tree, module) {
        for (var mod in tree) {
            if (mod == module) {
                // found
                var ret = {};
                if (tree[mod].hasOwnProperty("children")) {
                    var children = tree[mod]["children"];
                    for (var modR in children) {
                        ret[modR] = children[modR].module;
                    }
                }
                return ret;
            }
        }
        // not found
        for (var mod in tree) {
            if (tree[mod].hasOwnProperty("children")) {
                var res = privateFindChildren(tree[mod]["children"], module);
                if (res != null) // found
                    return res;
            }
        }
        // not exist
        return null;
    }
    this.findChildren = function (module) {
        return privateFindChildren(mapping, module);
    }
}

var relation = new Relation(mapping);

module.exports = relation;