/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/hamming-distance";
exports.ids = ["vendor-chunks/hamming-distance"];
exports.modules = {

/***/ "(rsc)/./node_modules/hamming-distance/index.js":
/*!************************************************!*\
  !*** ./node_modules/hamming-distance/index.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nvar assert = __webpack_require__(/*! assert */ \"assert\");\n\nmodule.exports = compare;\n\nfunction compare(a, b) {\n  a = hexToBinary(a)\n  b = hexToBinary(b)\n  assert.equal(a.length, b.length, 'Argument must have equal lengths.');\n  return hammingDistance(a, b);\n}\n\nvar lookup = {\n  '0': '0000',\n  '1': '0001',\n  '2': '0010',\n  '3': '0011',\n  '4': '0100',\n  '5': '0101',\n  '6': '0110',\n  '7': '0111',\n  '8': '1000',\n  '9': '1001',\n  'a': '1010',\n  'b': '1011',\n  'c': '1100',\n  'd': '1101',\n  'e': '1110',\n  'f': '1111',\n  'A': '1010',\n  'B': '1011',\n  'C': '1100',\n  'D': '1101',\n  'E': '1110',\n  'F': '1111'\n};\n\nfunction hexToBinary(s) {\n  if (Buffer.isBuffer(s)) s = s.toString('hex');\n  s = s.replace(/^0x/, '');\n  assert(/^[0-9a-fA-F]+$/.test(s));\n  var ret = '';\n  for (var i = 0; i < s.length; i++) ret += lookup[s[i]];\n  return ret;\n}\n\nfunction hammingDistance(a, b) {\n  a = hexToBinary(a);\n  b = hexToBinary(b);\n  var count = 0;\n  for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) count++;\n  return count;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvaGFtbWluZy1kaXN0YW5jZS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiO0FBQ0EsYUFBYSxtQkFBTyxDQUFDLHNCQUFROztBQUU3Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsY0FBYztBQUNoQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLGNBQWM7QUFDaEM7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3BhcmtzcG90Ly4vbm9kZV9tb2R1bGVzL2hhbW1pbmctZGlzdGFuY2UvaW5kZXguanM/MTAwNCJdLCJzb3VyY2VzQ29udGVudCI6WyJcbnZhciBhc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb21wYXJlO1xuXG5mdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcbiAgYSA9IGhleFRvQmluYXJ5KGEpXG4gIGIgPSBoZXhUb0JpbmFyeShiKVxuICBhc3NlcnQuZXF1YWwoYS5sZW5ndGgsIGIubGVuZ3RoLCAnQXJndW1lbnQgbXVzdCBoYXZlIGVxdWFsIGxlbmd0aHMuJyk7XG4gIHJldHVybiBoYW1taW5nRGlzdGFuY2UoYSwgYik7XG59XG5cbnZhciBsb29rdXAgPSB7XG4gICcwJzogJzAwMDAnLFxuICAnMSc6ICcwMDAxJyxcbiAgJzInOiAnMDAxMCcsXG4gICczJzogJzAwMTEnLFxuICAnNCc6ICcwMTAwJyxcbiAgJzUnOiAnMDEwMScsXG4gICc2JzogJzAxMTAnLFxuICAnNyc6ICcwMTExJyxcbiAgJzgnOiAnMTAwMCcsXG4gICc5JzogJzEwMDEnLFxuICAnYSc6ICcxMDEwJyxcbiAgJ2InOiAnMTAxMScsXG4gICdjJzogJzExMDAnLFxuICAnZCc6ICcxMTAxJyxcbiAgJ2UnOiAnMTExMCcsXG4gICdmJzogJzExMTEnLFxuICAnQSc6ICcxMDEwJyxcbiAgJ0InOiAnMTAxMScsXG4gICdDJzogJzExMDAnLFxuICAnRCc6ICcxMTAxJyxcbiAgJ0UnOiAnMTExMCcsXG4gICdGJzogJzExMTEnXG59O1xuXG5mdW5jdGlvbiBoZXhUb0JpbmFyeShzKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIocykpIHMgPSBzLnRvU3RyaW5nKCdoZXgnKTtcbiAgcyA9IHMucmVwbGFjZSgvXjB4LywgJycpO1xuICBhc3NlcnQoL15bMC05YS1mQS1GXSskLy50ZXN0KHMpKTtcbiAgdmFyIHJldCA9ICcnO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHJldCArPSBsb29rdXBbc1tpXV07XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGhhbW1pbmdEaXN0YW5jZShhLCBiKSB7XG4gIGEgPSBoZXhUb0JpbmFyeShhKTtcbiAgYiA9IGhleFRvQmluYXJ5KGIpO1xuICB2YXIgY291bnQgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIGlmIChhW2ldICE9PSBiW2ldKSBjb3VudCsrO1xuICByZXR1cm4gY291bnQ7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/hamming-distance/index.js\n");

/***/ })

};
;