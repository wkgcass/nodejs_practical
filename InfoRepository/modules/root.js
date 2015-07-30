var actions = [];

function Root() {
    this.actions = actions;
    this.check = function (condition) {
        return true;
    }
    this.description = "entrance of info-repository system";
    this.url = "/";
}
var root = new Root();
module.exports = root;