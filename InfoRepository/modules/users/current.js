var actions = [];

function Current() {
    this.actions = actions;
    this.check = function (condition) {
        return true;
    }
    this.description = "manage current logged in user";
    this.url = "/users/me";
}
var current = new Current();
module.exports = current;