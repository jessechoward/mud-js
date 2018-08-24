const config = require('config');
const redis = require('redis');

const client = redis.createClient(config.get('cache.redis'));
exports.client = client;

/**
 * set a key/value pair in the cache
 * @param {string} key the key to access the value by
 * @param {string|object} value the item to cache
 * @param {int} [expires] optionally expires the item in (expires) seconds
 * @returns {Promise} resolves if there are no errors, rejects on error
 */
exports.set = (key, value, expires) =>
{
	const ttl = expires || config.get('cache.default_ttl');

	return new Promise((resolve, reject) =>
	{
		client.setex(key, value, ttl, JSON.stringify(value), (error, reply) =>
		{
			if (error)
			{
				logger.error('redis cache error', {error: error});
				return reject(error);
			}
			return resolve();
		});
	});
};

/**
 * get a value from the cache at key
 * @param {string} key the key to look for the data at
 * @param {boolean} [remove=false] optionally remove the key after we have fetched it 
 * @returns {Promise} resolves with Object from cache or undefined if not found.
 * rejects on error
 */
exports.get = (key, remove=false) =>
{
	return new Promise((resolve, reject) =>
	{
		client.get(key, (error, reply) =>
		{
			if (error)
			{
				logger.error('redis cache error', {error: error});
				return reject(error);
			}

			// optionally remove the key
			// we don't care about the response
			client.del(key);
			// although it isn't an error, the key may not exist
			return resolve(reply ? JSON.parse(reply) : undefined);
		});
	});
};
