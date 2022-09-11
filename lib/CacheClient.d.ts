export declare class GetResponse extends String {
    data: any;
    constructor(data: any);
    log(): void;
}
export declare class CacheClient {
    private readonly _address;
    private readonly _port;
    private readonly _token;
    private _ws;
    private _refreshed;
    cache: any;
    /**
     * @param {string} address
     * @param {number} port
     * @param {string} password
     */
    constructor({ address, port, password }: {
        address: string;
        port: number;
        password: string;
    });
    /**
     * @param {string} key
     * @returns {Promise<any>}
     */
    get(key: string): Promise<GetResponse>;
    /**
     * @param {string} key
     * @param value
     * @param {number} ttl
     * @returns {Promise<void>}
     */
    set(key: string, value: any, ttl?: number): Promise<void>;
    /**
     * @param {string} key
     * @returns {Promise<void>}
     */
    delete(key: string): Promise<void>;
}
//# sourceMappingURL=CacheClient.d.ts.map