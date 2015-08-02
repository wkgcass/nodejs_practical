var mapping = {
    "passport": {
        "module": "./passport",
        "children": {
            "user": {
                "module": "./user",
                "children": {}
            }
        }
    }
};

function Relation(mapping) {
    var privateFindModule = function (tree, module) {
        for (var mod in tree) {
            if (mod == module) {
                return tree[mod].module;
            }
        }
        for (var mod in tree) {
            if (tree[mod].children != undefined) {
                var childRes = privateFindModule(tree[mod].children, module);
                if (null != childRes) {
                    return childRes;
                }
            }
        }
        return null;
    }
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
    this.getNamedModule = function (module_name) {
        var toRequire = privateFindModule(mapping, module_name);
        if (toRequire == null) return null;
        return require(toRequire);
    }
}

var relation = new Relation(mapping);

module.exports = relation;