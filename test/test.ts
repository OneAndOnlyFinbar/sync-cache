import { CacheClient, CacheServer } from '../lib';

const server = new CacheServer({ port: 3000, password: '1234' });

const client1 = new CacheClient({ address: '127.0.0.1', port: 3000, password: '1234' });
const client2 = new CacheClient({ address: '127.0.0.1', port: 3000, password: '1234' });

(async() => {
  await client1.set('test', 'test');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  (await client2.get('test')).log();
})();