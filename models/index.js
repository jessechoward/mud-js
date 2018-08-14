const config = require('config');
const fs = require('fs');
const path = require('path');
const Sequelize  = require('sequelize');
const logger = require('../src/logging');
const dbOptions = config.get('database.connection');

if (dbOptions.logging)
{
	// use the logger - make sure to bind the logging function
	// back to the logger instance!
	dbOptions.logging = logger[dbOptions.logger].bind(logger);
}

const db = new Sequelize(dbOptions);

db.authenticate()
	.catch((error) =>
	{
		logger.crit('Unable to connect to database', {error: error});
		process.exit(-1);
	});

// load all .js files in this directory as db modules
fs.readdirSync(__dirname)
	// filter for NOT this file AND the file extension is '.js'
	.filter((filename) => filename !== path.basename(__filename) && path.extname(filename) === '.js')
	// readDirSync returns an array offileNames.
	// filter applies a filter to the arry resulting in a new array of filenames
	// consisting of filenames that pass the filter test and return true
	.forEach((filename) =>
	{
		// import models
		db.import(path.join(__dirname, filename));
	});

// do any associations if they exist
// IMPORTANT!!! Do this BEFORE calling sync!
Object.keys(db.models).forEach((modelName) =>
{
	if (db.models[modelName].hasOwnProperty('associate')) db.models[modelName].associate();
});

// create tables if they dont exist
db.sync(config.get('database.sync'))
	.then((result) =>
	{
		logger.info('Sync database complete');
	})
	.catch((error) =>
	{
		logger.crit('Failed to sync database', {error: error});
		// this is a fatal error
		process.exit(1);
	});

module.exports = db;