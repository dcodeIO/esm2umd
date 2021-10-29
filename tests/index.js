const assert = require("assert");
const util = require("util");

function testCJS() {
  console.log("# CommonJS");
  const index = require("../index.cjs");
  assert(typeof index === "function");
  console.log(util.inspect(index, { showHidden: true }));
}
testCJS();

async function testESM() {
  console.log("# ESM");
  const index = await import("../index.js");
  assert(typeof index === "object");
  assert(typeof index.default === "function");
  console.log(util.inspect(index, { showHidden: true }));
}
testESM();
