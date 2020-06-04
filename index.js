import babel from "@babel/core";
import transform from "@babel/plugin-transform-modules-commonjs";

const wrapper = `// GENERATED FILE. DO NOT EDIT.\nvar %NAME% = (function(exports) {
  %CODE%
  return exports;
})({});
if (typeof define === 'function' && define.amd) define([], function() { return %NAME%; });
else if (typeof module === 'object' && typeof exports==='object') module.exports = %NAME%;
`;

export default function esm2umd(moduleName, esmCode) {
  const umdCode = babel.transform(esmCode, {
    plugins: [
      [ transform, { noInterop: true } ]
    ]
  }).code.trim();
  return wrapper
    .replace(/%NAME%/g, moduleName)
    .replace("%CODE%", umdCode.replace(/\n/g, "\n  ").trimRight());
}
