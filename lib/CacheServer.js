"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheServer = void 0;
var WebSocketConnection = require('websocket').WebSocketConnection;
var WebSocketServer = require('websocket').server;
var http = require('http');
var CacheServer = /** @class */ (function () {
    /**
     * @param {number} port
     * @param {string} password
     */
    function CacheServer(_a) {
        var port = _a.port, password = _a.password;
        var _this = this;
        this._serverCache = {};
        this._connections = [];
        this._httpServer = http.createServer();
        this._wss = new WebSocketServer({ httpServer: this._httpServer, path: '/ws' });
        this._port = port;
        this._password = password;
        this._wss.on('request', function (request) {
            var connection = request.accept();
            connection.on('message', function (message) {
                var _a;
                var type = message.type, utf8Data = message.utf8Data;
                if (type !== 'utf8') {
                    connection.send(Buffer.from(JSON.stringify({ success: false, message: 'Invalid message type. Connection closed.' })).toString('base64'));
                    return connection.close();
                }
                var messagePayload;
                try {
                    messagePayload = JSON.parse(utf8Data);
                }
                catch (_b) {
                    connection.send(Buffer.from(JSON.stringify({ success: false, message: 'Invalid message payload. Connection closed.' })).toString('base64'));
                    return connection.close();
                }
                if (!(messagePayload === null || messagePayload === void 0 ? void 0 : messagePayload.token) || _this._password !== (messagePayload === null || messagePayload === void 0 ? void 0 : messagePayload.token)) {
                    connection.send(Buffer.from(JSON.stringify({ success: false, message: 'Invalid token. Connection closed.' })).toString('base64'));
                    return connection.close();
                }
                _this._connections.push(connection);
                switch (messagePayload === null || messagePayload === void 0 ? void 0 : messagePayload.operation) {
                    case 'setKeyRequest': {
                        var key_1 = messagePayload.key, value_1 = messagePayload.value, ttl_1 = messagePayload.ttl;
                        if ((key_1 === null || key_1 === void 0 ? void 0 : key_1.length) === 0 || !((_a = value_1 === null || value_1 === void 0 ? void 0 : value_1.toString()) === null || _a === void 0 ? void 0 : _a.length) && !(key_1 === null || key_1 === void 0 ? void 0 : key_1.split('.').length)) {
                            connection.send(Buffer.from(JSON.stringify({ success: false, message: 'Invalid key or value. Connection closed.' })).toString('base64'));
                            return connection.close();
                        }
                        var keys = key_1.split('.');
                        var current = _this._serverCache;
                        for (var i = 0; i < keys.length - 1; i++)
                            current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
                        current[keys[keys.length - 1]] = value_1;
                        _this._connections.forEach(function (c) { return c.send(Buffer.from(JSON.stringify({ success: true, operation: 'setKeyResponse', key: key_1, value: value_1, ttl: ttl_1 })).toString('base64')); });
                        break;
                    }
                    case 'deleteKeyRequest': {
                        var key_2 = messagePayload.key;
                        if ((key_2 === null || key_2 === void 0 ? void 0 : key_2.length) === 0 && !(key_2 === null || key_2 === void 0 ? void 0 : key_2.split('.').length)) {
                            connection.send(Buffer.from(JSON.stringify({ success: false, message: 'Invalid key. Connection closed.' })).toString('base64'));
                            return connection.close();
                        }
                        var keys = key_2.split('.');
                        var current = _this._serverCache;
                        for (var i = 0; i < keys.length - 1; i++)
                            current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
                        delete current[keys[keys.length - 1]];
                        _this._connections.forEach(function (c) { return c.send(Buffer.from(JSON.stringify({ success: true, operation: 'deleteKeyResponse', key: key_2 })).toString('base64')); });
                        break;
                    }
                    case 'fetchAllRequest': {
                        var keys = Object.keys(_this._serverCache);
                        var values = keys.map(function (k) { return _this._serverCache[k]; });
                        connection.send(Buffer.from(JSON.stringify({ success: true, operation: 'fetchAllResponse', keys: keys, values: values })).toString('base64'));
                    }
                }
            });
        });
        this._httpServer.listen(this._port, function () {
            console.log("Server running at http://127.0.0.1:".concat(_this._port, "/"));
        });
    }
    return CacheServer;
}());
exports.CacheServer = CacheServer;
