const config = require('config');
const fs = require('fs');
const path = require('path');
const redis = require('redis');

// initialize redis
const redisClient = redis.createClient(config.get('redis'));
// the db object to add models to
const db = {};

fs.readdirSync(__dirname)
	.filter((filename) => filename !== path.basename(__filename) && path.extname(filename) === '.js')
	.forEach((filename) =>
	{
		
	});