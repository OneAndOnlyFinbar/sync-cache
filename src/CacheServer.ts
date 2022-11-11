const { WebSocketConnection } = require('websocket');
const WebSocketServer = require('websocket').server;
const http = require('http');

export class CacheServer {
	private readonly _httpServer: typeof http.Server;
	private readonly _password: string;
	private readonly _port: number;
	private _wss: typeof WebSocketServer;
	private _serverCache: { [key: string]: any } = {};
	private _connections: typeof WebSocketConnection[] = [];
    private _debug: boolean;
	/**
     * @param {number} port
     * @param {string} password
     * @param debug
     */
	constructor({ port, password, debug }: { port: number, password: string, debug?: boolean }) {
		this._httpServer = http.createServer();
		this._wss = new WebSocketServer({ httpServer: this._httpServer, path: '/ws' });
		this._port = port;
		this._password = password;
        this._debug = debug;

		this._wss.on('request', (request: any) => {
			const connection: typeof WebSocketConnection = request.accept();

			connection.on('message', (message: any) => {
				const { type, utf8Data } = message;
				if (type !== 'utf8'){
					connection.send(Buffer.from(JSON.stringify({ success: false, message: 'Invalid message type. Connection closed.' })).toString('base64'));
					return connection.close();
				}
				let messagePayload;
				try{
					messagePayload = JSON.parse(utf8Data);
				}catch{
					connection.send(Buffer.from(JSON.stringify({ success: false, message: 'Invalid message payload. Connection closed.' })).toString('base64'));
					return connection.close();
				}
				if (!messagePayload?.token || this._password !== messagePayload?.token){
					connection.send(Buffer.from(JSON.stringify({ success: false, message: 'Invalid token. Connection closed.' })).toString('base64'));
					return connection.close();
				}
				this._connections.push(connection);
				switch(messagePayload?.operation){
					case 'setKeyRequest': {
						const { key, value, ttl } = messagePayload
						if(key?.length === 0 || !value?.toString()?.length && !key?.split('.').length){
							connection.send(Buffer.from(JSON.stringify({ success: false, message: 'Invalid key or value. Connection closed.' })).toString('base64'));
							return connection.close();
						}
						const keys = key.split('.');
						let current = this._serverCache;
						for(let i = 0; i < keys.length - 1; i++)
							current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
						current[keys[keys.length - 1]] = value;
						this._connections.forEach(c => c.send(Buffer.from(JSON.stringify({ success: true, operation: 'setKeyResponse', key, value, ttl })).toString('base64')));
						break;
					}
					case 'deleteKeyRequest': {
						const { key } = messagePayload;
						if(key?.length === 0 && !key?.split('.').length){
							connection.send(Buffer.from(JSON.stringify({ success: false, message: 'Invalid key. Connection closed.' })).toString('base64'));
							return connection.close();
						}
						const keys = key.split('.');
						let current = this._serverCache;
						for(let i = 0; i < keys.length - 1; i++)
							current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
						delete current[keys[keys.length - 1]];
						this._connections.forEach(c => c.send(Buffer.from(JSON.stringify({ success: true, operation: 'deleteKeyResponse', key })).toString('base64')));
						break;
					}
					case 'fetchAllRequest': {
						const keys = Object.keys(this._serverCache);
						const values = keys.map(k => this._serverCache[k]);
						connection.send(Buffer.from(JSON.stringify({ success: true, operation: 'fetchAllResponse', keys, values })).toString('base64'));
					}
				}
			});
		});

		this._httpServer.listen(this._port, () => {
			if(this._debug)
                console.log(`Server running at http://127.0.0.1:${this._port}/`);
		});
	}
    close(){
        this._httpServer.close();
    }
}