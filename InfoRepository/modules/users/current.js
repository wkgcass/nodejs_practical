var actions = [];

function Current() {
    this.actions = actions;
    this.check = function (condition) {
        return true;
    }
    this.description = "entrance of info-repository system";
    this.url = "/users/me";
}
var current = new Current();
module.exports = current;