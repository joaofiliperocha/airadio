const fs = require("fs");
const fileName = "airadiodata.json"


function load() {
    const sData = fs.readFileSync(fileName, { encoding: "utf-8" });
    return JSON.parse(sData);
}

function save(content) {
    fs.writeFileSync(fileName, JSON.stringify(content));
}

module.exports = {
    load,
    save
}