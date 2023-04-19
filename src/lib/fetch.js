"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.POST = exports.GET = void 0;
var node_http_1 = require("node:http");
var node_https_1 = require("node:https");
var node_url_1 = require("node:url");
function GET(target) {
    var url = new node_url_1.URL(target);
    return new Promise(function (resolve, reject) {
        (url.protocol === "http:" ? node_http_1["default"] : node_https_1["default"])
            .get(url.href, function (res) {
            var data = [];
            res.on("data", function (d) { return data.push(d); });
            res.on("end", function () { return resolve(data); });
            res.on("error", function (error) { return reject(error); });
        });
    });
}
exports.GET = GET;
function POST(target, data, headers) {
    var url = new node_url_1.URL(target);
    var options = {
        hostname: url.hostname,
        path: url.pathname,
        port: url.port,
        method: "POST",
        headers: __assign(__assign({}, headers), { 'Content-length': Buffer.byteLength(data) })
    };
    return new Promise(function (resolve, reject) {
        var request = (url.protocol === "http:" ? node_http_1["default"] : node_https_1["default"])
            .request(options, function (res) {
            var data = [];
            res.on("data", function (d) { return data.push(d); });
            res.on("end", function () { return resolve(data); });
        });
        request.on("error", function (error) { return reject(error); });
        request.write(data);
        request.end();
    });
}
exports.POST = POST;
