"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalCache = void 0;
var CacheClient_1 = require("./CacheClient");
var LocalCache = /** @class */ (function () {
    function LocalCache() {
        this._cache = {};
    }
    LocalCache.prototype.get = function (key) {
        var keys = key.split('.');
        var current = this._cache;
        for (var i = 0; i < keys.length - 1; i++)
            current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
        return new CacheClient_1.GetResponse(current[keys[keys.length - 1]]);
    };
    LocalCache.prototype.set = function (key, value) {
        var keys = key.split('.');
        var current = this._cache;
        for (var i = 0; i < keys.length - 1; i++)
            current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
        current[keys[keys.length - 1]] = value;
    };
    LocalCache.prototype.delete = function (key) {
        var keys = key.split('.');
        var current = this._cache;
        for (var i = 0; i < keys.length - 1; i++)
            current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
        delete current[keys[keys.length - 1]];
    };
    LocalCache.prototype.fetchAll = function () {
        return this._cache;
    };
    return LocalCache;
}());
exports.LocalCache = LocalCache;
