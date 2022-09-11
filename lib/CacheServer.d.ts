export declare class CacheServer {
    private readonly _httpServer;
    private readonly _password;
    private readonly _port;
    private _wss;
    private _serverCache;
    private _connections;
    /**
     * @param {number} port
     * @param {string} password
     */
    constructor({ port, password }: {
        port: number;
        password: string;
    });
}
//# sourceMappingURL=CacheServer.d.ts.map