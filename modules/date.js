exports.getDate = function () {
    const options = {weekday: "long", day: "numeric", month: "long"};   
    const today = new Date();
    return today.toLocaleDateString("en-US", options);
}

exports.getDay = function getDay() {
    const options = {weekday: "long"};   
    const today = new Date();
    return today.toLocaleDateString("en-US", options);
}
