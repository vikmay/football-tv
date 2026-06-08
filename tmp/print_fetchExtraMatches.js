const fs = require("fs");

const t = fs.readFileSync("parse.js", "utf8");
const i = t.indexOf("async function fetchExtraMatches()");
if (i === -1) {
    console.error("fetchExtraMatches() not found");
    process.exit(1);
}
console.log(t.slice(i, i + 2600));
