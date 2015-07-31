var actions = [];

function Designated() {
    this.actions = actions;
    this.check = function (condition) {
        return true;
    }
    this.description = "retrieve a user's info";
    this.url = "/users/{$user_name}";
}
var designated = new Designated();
module.exports = designated;