const config = require('config');
const fs = require('fs');
const path = require('path');
const bluebird = require('bluebird');
const redis = require('redis');

// promisify redis
bluebird.promisifyAll(redis);

// initialize redis
const redisClient = redis.createClient(config.get('redis.clientOptions'));
// the db object to add models to
const db = {};

// load all .js files in this directory as db modules
fs.readdirSync(__dirname)
	// filter for NOT this file AND the file extension is '.js'
	.filter((filename) => filename !== path.basename(__filename) && path.extname(filename) === '.js')
	// readDirSync returns an array offileNames.
	// filter applies a filter to the arry resulting in a new array of filenames
	// consisting of filenames that pass the filter test and return true
	.forEach((filename) =>
	{
		// require the file and add the module as a part of the db
		// we will pass the redis connection to the module.exports function of each module
		db[path.basename(filename, 'js').toLowerCase()] = require(path.join(__dirname, __filename)(redisClient));
	});

// shouldn't need this but add the redisClient for direct use
db.redisClient = redisClient;
// a pubsub connection exclusively for pubsub operations
db.pubsub = redisClient.pubsub();

module.exports = db;