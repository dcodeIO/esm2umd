var esm2umd = (function(exports) {
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = esm2umd;
  
  var _core = require("@babel/core");
  
  const wrapper = `var %NAME% = (function(exports) {
    %CODE%
    return exports;
  })({});
  if (typeof define === 'function' && define.amd) define([], function() { return %NAME%; });
  else if (typeof module === 'object' && typeof exports==='object') module.exports = %NAME%;
  `;
  
  function esm2umd(moduleName, esmModuleCode) {
    const umdModuleCode = _core.default.transform(esmModuleCode, {
      plugins: [["@babel/plugin-transform-modules-commonjs", {
        noInterop: true
      }]]
    }).code.trim();
  
    return wrapper.replace(/%NAME%/g, moduleName).replace('%CODE%', umdModuleCode.replace(/\n/g, '\n  ').trimRight());
  }
  return exports;
})({});
if (typeof define === 'function' && define.amd) define([], function() { return esm2umd; });
else if (typeof module === 'object' && typeof exports==='object') module.exports = esm2umd;
