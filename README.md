# sync-cache

Application to synchronize cache between multiple processes.

# Compiling

Run

```
tsc
```

# Example

## Example

###### cache.js

```js
const { CacheClient, CacheServer } = require('./lib');
const Server = new CacheServer({ port: 3000, password: 'secret!!' });

const Client1 = new CacheClient({ port: 3000, password: 'secret!!' });
const Client2 = new CacheClient({ port: 3000, password: 'secret!!' });

(async() => {
    await Client1.set('key', 'value');
    (await Client2.get('key')).log(); // value
    await Client2.delete('key');
    (await Client1.get('key')).log(); // undefined
    
    // You can also access the local cache directly, be careful with this
    await Client1.cache.set('key', 'value');
    await Client1.cache.get('key').log(); // value
    (await Client2.get('key')).log(); // undefined
    
    // You can also use JSON path notation to access nested objects
    await Client1.set('key', { nested: { value: 'value' } });
    (await Client2.get('key.nested.value')).log(); // value
})();
```

# Documentation

### Setting Values

Use the `<CacheClient>#set` method to set a value.<br>
`key` Is a string of the property or json path to set.<br>
`value` Is the value to set the provided path to.<br>
`ttl` Is an integer in ms for how long the data should persist.<br>

```js
await <CacheClient>.set(key, value, ttl);
```

### Getting Values

Use the `<CacheClient>#get` method to get a value.<br>
`key` Is a string of the property or json path get.<br>

```js
await <CacheClient>.get(key);
```

### Deleting Values

Use the `<CacheClient>#delete` method to delete a value.<br>
`key` Is a string of the property or json path delete.<br>

```js
await <CacheClient>.delete(key);
```

### Local Cache
All cache clients have a local cache that can be accessed directly.<br>
This is useful for when you want to access the cache without having to make a request to the server.<br>
Be careful with this, especially with writes as it does not refresh against all clients.<br>

```js
<CacheClient>.cache.set(key, value);
<CacheClient>.cache.get(key);
<CacheClient>.cache.delete(key);
```