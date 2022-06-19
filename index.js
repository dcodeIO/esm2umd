import babel from "@babel/core";
import transform from "@babel/plugin-transform-modules-commonjs";

const wrapper = (name, code) => (
`// GENERATED FILE. DO NOT EDIT.
var ${name} = (function(exports) {
  ${code}
  return "default" in exports ? exports.default : exports;
})({});
if (typeof define === 'function' && define.amd) define([], function() { return ${name}; });
else if (typeof module === 'object' && typeof exports === 'object') module.exports = ${name};
`);

export default function esm2umd(moduleName, esmCode, options = {}) {
  if (!options.importInterop) options.noInterop = true;
  const umdCode = babel.transform(esmCode, {
    plugins: [
      [ transform, options ]
    ]
  }).code.trim();
  return wrapper(moduleName, umdCode.replace(/\n/g, "\n  ").trimEnd());
}
