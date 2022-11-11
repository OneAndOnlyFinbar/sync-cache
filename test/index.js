const {CacheServer, CacheClient, LocalCache} = require('../lib');
const should = require('should');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Security', async () => {
    it('Should reject connection with invalid password.', async () => {
        const server = new CacheServer({port: 3000, password: 'test', debug: false});
        const client = new CacheClient({port: 3000, password: 'te2st', address: 'localhost'})
        await wait(500);
        client._ws.readyState.should.be.within(2, 3);
        server.close();
    });
    it('Should connect with correct password', async () => {
        const server = new CacheServer({port: 3000, password: 'test', debug: false});
        const client = new CacheClient({port: 3000, password: 'test', address: 'localhost'});
        await wait(500);
        client._ws.readyState.should.equal(1);
        server.close();
    });
})

describe('Local Cache', async () => {
    it('Should set and get value', async () => {
        const cache = new LocalCache();
        await cache.set('test', 'test');
        const value = await cache.get('test');
        should(value.data).equal('test');
    });
    it('Should delete value', async () => {
        const cache = new LocalCache();
        await cache.set('test', 'test');
        await cache.delete('test');
        const value = await cache.get('test');
        should(value.data).equal(undefined);
    });
});

describe('Cache Server', async () => {
    it('Should set and get value', async () => {
        const server = new CacheServer({port: 3000, password: 'test', debug: false});
        const client = new CacheClient({port: 3000, password: 'test', address: 'localhost'});
        await client.set('test', 'test');
        const value = await client.get('test');
        should(value.data).equal('test');
        server.close();
    });
    it('Should delete value', async () => {
        const server = new CacheServer({port: 3000, password: 'test', debug: false});
        const client = new CacheClient({port: 3000, password: 'test', address: 'localhost'});
        await client.set('test', 'test');
        await client.delete('test');
        const value = await client.get('test');
        should(value.data).equal(undefined);
        server.close();
    });
    it('Should set and get value with ttl', async () => {
        const server = new CacheServer({port: 3000, password: 'test', debug: false});
        const client = new CacheClient({port: 3000, password: 'test', address: 'localhost'});
        await client.set('test', 'test', 1000);
        const value = await client.get('test');
        should(value.data).equal('test');
        await wait(1500);
        const value2 = await client.get('test');
        should(value2.data).equal(undefined);
        server.close();
    });
});

describe('Cache Client', async () => {
    it('Should set and get value', async () => {
        const server = new CacheServer({port: 3000, password: 'test', debug: false});
        const client = new CacheClient({port: 3000, password: 'test', address: 'localhost'});
        await client.set('test', 'test');
        const value = await client.get('test');
        should(value.data).equal('test');
        server.close();
    });
    it('Should delete value', async () => {
        const server = new CacheServer({port: 3000, password: 'test', debug: false});
        const client = new CacheClient({port: 3000, password: 'test', address: 'localhost'});
        await client.set('test', 'test');
        await client.delete('test');
        const value = await client.get('test');
        should(value.data).equal(undefined);
        server.close();
    });
    it('Should set and get value with ttl', async () => {
        const server = new CacheServer({port: 3000, password: 'test', debug: false});
        const client = new CacheClient({port: 3000, password: 'test', address: 'localhost'});
        await client.set('test', 'test', 1000);
        const value = await client.get('test');
        should(value.data).equal('test');
        await wait(1500);
        const value2 = await client.get('test');
        should(value2.data).equal(undefined);
        server.close();
    });
})