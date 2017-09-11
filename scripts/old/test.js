one();

function one() {
    getTime();
    setTimeout(two, 1000);
    setTimeout(two(), 5000);
}
function two() {
    var three = function() {console.log("three")};
    console.log("two");
    getTime();
    return three;
}

function getTime() {
    var now = new Date();
    console.log(now.toLocaleTimeString());
}