var actions = [];

function Designated() {
    this.actions = actions;
    this.check = function (condition) {
        return true;
    }
    this.description = "entrance of info-repository system";
    this.url = "/users/{$user_name}";
}
var designated = new Designated();
module.exports = designated;