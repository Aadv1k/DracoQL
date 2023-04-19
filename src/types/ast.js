"use strict";
exports.__esModule = true;
exports.DestType = exports.OrType = exports.DataType = exports.BodyType = void 0;
var BodyType;
(function (BodyType) {
    BodyType["JSON"] = "JSON";
    BodyType["TEXT"] = "TEXT";
    BodyType["FILE"] = "FILE";
    BodyType["FORM"] = "FORM";
})(BodyType = exports.BodyType || (exports.BodyType = {}));
var DataType;
(function (DataType) {
    DataType["JSON"] = "JSON";
    DataType["TEXT"] = "TEXT";
    DataType["BUFFER"] = "BUFFER";
    DataType["FILE"] = "FILE";
    DataType["NULL"] = "NULL";
})(DataType = exports.DataType || (exports.DataType = {}));
var OrType;
(function (OrType) {
    OrType["DIE"] = "DIE";
    OrType["EXIT"] = "EXIT";
})(OrType = exports.OrType || (exports.OrType = {}));
var DestType;
(function (DestType) {
    DestType["FILE"] = "FILE";
    DestType["STDOUT"] = "STDOUT";
    DestType["SQL"] = "SQL";
    DestType["DOCUMET"] = "DOCUMENT";
    DestType["WEBRESOURCE"] = "WEBRESOURCE";
    DestType["FILE_SERVER"] = "FILE_SERVER";
    DestType["EXTERN"] = "EXTERN";
})(DestType = exports.DestType || (exports.DestType = {}));
