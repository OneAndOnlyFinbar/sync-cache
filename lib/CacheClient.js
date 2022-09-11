"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheClient = void 0;
var WebSocket = require('isomorphic-ws');
var GetResponse = /** @class */ (function (_super) {
    __extends(GetResponse, _super);
    function GetResponse(data) {
        var _this = _super.call(this) || this;
        _this.data = data;
        return _this;
    }
    GetResponse.prototype.log = function () {
        console.log(this.data);
    };
    return GetResponse;
}(String));
var CacheClient = /** @class */ (function () {
    /**
     * @param {string} address
     * @param {number} port
     * @param {string} password
     */
    function CacheClient(_a) {
        var address = _a.address, port = _a.port, password = _a.password;
        var _this = this;
        this._rawCache = {};
        this._refreshed = false;
        this._address = address || '127.0.0.1';
        this._port = port || 3001;
        this._token = password;
        this._ws = new WebSocket("ws://".concat(this._address, ":").concat(this._port, "/ws"));
        this._ws.onopen = function () {
            _this._ws.send(JSON.stringify({
                operation: 'fetchAllRequest',
                token: _this._token
            }));
        };
        this._ws.onmessage = function (payload) {
            var _a = JSON.parse(Buffer.from(payload.data, 'base64').toString()), operation = _a.operation, success = _a.success, message = _a.message, key = _a.key, value = _a.value;
            if (!success)
                throw new Error(message);
            switch (operation) {
                case 'setKeyResponse': {
                    var _b = JSON.parse(Buffer.from(payload.data, 'base64').toString()), key_1 = _b.key, value_1 = _b.value, ttl = _b.ttl;
                    var keys = key_1.split('.');
                    var current = _this._rawCache;
                    for (var i = 0; i < keys.length - 1; i++)
                        current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
                    current[keys[keys.length - 1]] = value_1;
                    if (ttl > 0)
                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.delete(key_1)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, ttl);
                    break;
                }
                case 'fetchAllResponse': {
                    var _c = JSON.parse(Buffer.from(payload.data, 'base64').toString()), keys = _c.keys, values_1 = _c.values;
                    keys.forEach(function (key, i) { return _this._rawCache[key] = values_1[i]; });
                    _this._refreshed = true;
                    break;
                }
            }
        };
    }
    /**
     * @param {string} key
     * @returns {Promise<any>}
     */
    CacheClient.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, current, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this._ws.readyState || this._refreshed !== true)) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        keys = key.split('.');
                        current = this._rawCache;
                        for (i = 0; i < keys.length - 1; i++)
                            current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
                        return [2 /*return*/, new GetResponse(current[keys[keys.length - 1]])];
                }
            });
        });
    };
    /**
     * @param {string} key
     * @param value
     * @param {number} ttl
     * @returns {Promise<void>}
     */
    CacheClient.prototype.set = function (key, value, ttl) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, current, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this._ws.readyState || this._refreshed !== true)) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        keys = key.split('.');
                        current = this._rawCache;
                        for (i = 0; i < keys.length - 1; i++)
                            current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
                        current[keys[keys.length - 1]] = value;
                        return [4 /*yield*/, this._ws.send(JSON.stringify({
                                operation: 'setKeyRequest',
                                token: this._token,
                                key: key,
                                value: value,
                                ttl: ttl
                            }))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param {string} key
     * @returns {Promise<void>}
     */
    CacheClient.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, current, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this._ws.readyState || this._refreshed !== true)) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        keys = key.split('.');
                        current = this._rawCache;
                        for (i = 0; i < keys.length - 1; i++)
                            current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
                        delete current[keys[keys.length - 1]];
                        this._ws.send(JSON.stringify({
                            operation: 'deleteKeyRequest',
                            token: this._token,
                            key: key
                        }));
                        return [2 /*return*/];
                }
            });
        });
    };
    return CacheClient;
}());
exports.CacheClient = CacheClient;
