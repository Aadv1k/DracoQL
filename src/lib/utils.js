"use strict";
exports.__esModule = true;
exports.isLowerCase = exports.isURL = void 0;
function isURL(input) {
    var httpRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    return httpRegex.test(input);
}
exports.isURL = isURL;
function isLowerCase(str) {
    return str.toLowerCase() === str;
}
exports.isLowerCase = isLowerCase;
