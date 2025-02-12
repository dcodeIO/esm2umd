const assert = require("assert");
const util = require("util");
const path = require("path");
const fs = require("fs");
const vm = require("vm");

const tests = [

  async function esm() {
    const index = await import("../index.js");
    assert.equal(Object.prototype.toString.call(index), "[object Module]");
    assert(typeof index === "object");
    assert(typeof index.default === "function");
    console.log(util.inspect(index, { showHidden: true }));
  },

  async function commonjs() {
    const index = require("../umd/index.js");
    assert.equal(Object.prototype.toString.call(index), "[object Function]");
    assert(typeof index === "function");
    console.log(util.inspect(index, { showHidden: true }));
  },

  async function global() {
    const umdSource = await fs.promises.readFile(path.join(__dirname, "..", "umd", "index.js"), "utf8");
    const context = vm.createContext({
      window: {},
      helperPluginUtils: { declare: function() {} },
      path: {},
      helperModuleTransforms: {},
      core: { template: function() {} },
    })
    context.window = context;
    vm.runInContext(umdSource, context);
    const index = context.esm2umd;
    assert.equal(Object.prototype.toString.call(index), "[object Function]");
    assert(typeof index === "function");
    console.log(util.inspect(index, { showHidden: true }));
  },

  function amd() {
    return new Promise((resolve, reject) => {
      const requirejs = require("requirejs");
      requirejs.config({
        baseUrl: path.join(__dirname, "..", "umd"),
        paths: {
          "esm2umd": "index",
        },
      });
      requirejs(["esm2umd"], function (index) {
        try {
          assert.equal(Object.prototype.toString.call(index), "[object Function]");
          assert(typeof index === "function");
          console.log(util.inspect(index, { showHidden: true }));
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

];

function next() {
  if (!tests.length) return;
  const test = tests.shift();
  console.log(test.name);
  test().then(next);
}
next();
