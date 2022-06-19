// GENERATED FILE. DO NOT EDIT.
var esm2umd = (function(exports) {
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = esm2umd;
  
  var _core = require("@babel/core");
  
  var _pluginTransformModulesCommonjs = require("@babel/plugin-transform-modules-commonjs");
  
  const wrapper = (name, code) => `// GENERATED FILE. DO NOT EDIT.
  var ${name} = (function(exports) {
    ${code}
    return "default" in exports ? exports.default : exports;
  })({});
  if (typeof define === 'function' && define.amd) define([], function() { return ${name}; });
  else if (typeof module === 'object' && typeof exports === 'object') module.exports = ${name};
  `;
  
  function esm2umd(moduleName, esmCode, options = {}) {
    if (!options.importInterop) options.noInterop = true;
  
    const umdCode = _core.default.transform(esmCode, {
      plugins: [[_pluginTransformModulesCommonjs.default, options]]
    }).code.trim();
  
    return wrapper(moduleName, umdCode.replace(/\n/g, "\n  ").trimEnd());
  }
  return "default" in exports ? exports.default : exports;
})({});
if (typeof define === 'function' && define.amd) define([], function() { return esm2umd; });
else if (typeof module === 'object' && typeof exports === 'object') module.exports = esm2umd;
