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

	// You can also access the cache directly
	await Server.cache.set('key', 'value');
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