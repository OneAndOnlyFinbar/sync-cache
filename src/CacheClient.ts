const WebSocket = require('isomorphic-ws');
const { LocalCache } = require('./LocalCache');

export class GetResponse extends String {
  data: any;
  constructor(data: any) {
    super();
    this.data = data;
  }
  log(): void{
    console.log(this.data);
  }
}

export class CacheClient {
  private readonly _address: string;
  private readonly _port: number;
  private readonly _token: string;
  private _ws: typeof WebSocket;
  private _refreshed: boolean = false;
  public cache = new LocalCache();

  /**
   * @param {string} address
   * @param {number} port
   * @param {string} password
   */
  constructor({ address, port, password }: { address: string, port: number, password: string }) {
    this._address = address || '127.0.0.1';
    this._port = port || 3001;
    this._token = password;
    this._ws = new WebSocket(`ws://${this._address}:${this._port}/ws`);
    this._ws.onopen = () => {
      this._ws.send(JSON.stringify({
        operation: 'fetchAllRequest',
        token: this._token
      }));
    };

    this._ws.onmessage = (payload) => {
      const { operation, success, message, key, value } = JSON.parse(Buffer.from(payload.data, 'base64').toString());
      if(!success)
        throw new Error(message);
      switch(operation) {
        case 'setKeyResponse': {
          const { key, value, ttl } = JSON.parse(Buffer.from(payload.data, 'base64').toString());
          const keys = key.split('.');
          let current = this.cache.fetchAll();
          for(let i = 0; i < keys.length - 1; i++)
            current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
          current[keys[keys.length - 1]] = value;
          if(ttl > 0)
            setTimeout(async() => {
              await this.delete(key);
            }, ttl);
          break;
        }
        case 'fetchAllResponse': {
          const { keys, values } = JSON.parse(Buffer.from(payload.data, 'base64').toString());
          keys.forEach((key, i) => this.cache.fetchAll()[key] = values[i]);
          this._refreshed = true;
          break;
        }
        case 'deleteKeyResponse': {
          this.cache.delete(key);
          break;
        }
      }
    };
  }

  /**
   * @param {string} key
   * @returns {Promise<any>}
   */
  async get(key: string): Promise<GetResponse> {
    while(!this._ws.readyState || this._refreshed !== true) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const keys = key.split('.');
    let current = this.cache.fetchAll();
    for(let i = 0; i < keys.length - 1; i++)
      current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
    return new GetResponse(current[keys[keys.length - 1]]);
  }

  /**
   * @param {string} key
   * @param value
   * @param {number} ttl
   * @returns {Promise<void>}
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    while(!this._ws.readyState || this._refreshed !== true) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const keys = key.split('.');
    let current = this.cache.fetchAll();
    for(let i = 0; i < keys.length - 1; i++)
      current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    await this._ws.send(JSON.stringify({
      operation: 'setKeyRequest',
      token: this._token,
      key,
      value,
      ttl
    }));
  }

  /**
   * @param {string} key
   * @returns {Promise<void>}
   */
  async delete(key: string): Promise<void> {
    while(!this._ws.readyState || this._refreshed !== true) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const keys = key.split('.');
    let current = this.cache.fetchAll();
    for(let i = 0; i < keys.length - 1; i++)
      current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
    delete current[keys[keys.length - 1]];
    this.cache.delete(key);
    this._ws.send(JSON.stringify({
      operation: 'deleteKeyRequest',
      token: this._token,
      key
    }));
  }
}