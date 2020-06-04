import babel from "@babel/core";

const wrapper = `var %NAME% = (function(exports) {
  %CODE%
  return exports;
})({});
if (typeof define === 'function' && define.amd) define([], function() { return %NAME%; });
else if (typeof module === 'object' && typeof exports==='object') module.exports = %NAME%;
`;

export default function esm2umd(moduleName, esmCode) {
  const umdCode = babel.transform(esmCode, {
    plugins: [
      ["@babel/plugin-transform-modules-commonjs", {
        noInterop: true
      }]
    ]
  }).code.trim();
  return wrapper
    .replace(/%NAME%/g, moduleName)
    .replace('%CODE%', umdCode.replace(/\n/g, '\n  ').trimRight());
}
