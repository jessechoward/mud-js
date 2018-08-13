const fs = require('fs');
const path = require('path');
const ajv = require('ajv');
const logger = require('../../src/logging');

// note that useDefaults will modify the data being validated to contain
// default values for required fields where available
const validator = new ajv({logger: logger, useDefaults: true, unicode: false});
const schemas = {};

// load all .json files in this directory as schemas
fs.readdirSync(__dirname)
	// filter for file extension is '.json'
	.filter((filename) => path.extname(filename) === '.json')
	// readDirSync returns an array offileNames.
	// filter applies a filter to the arry resulting in a new array of filenames
	// consisting of filenames that pass the filter test and return true
	.forEach((filename) =>
	{
		// load the file contents and parse the json
		fs.readFile(path.join(__dirname, filename), 'utf8', (data) =>
		{
			try
			{
				// normalize names to all lower case and convert spaces to underscores
				// !! a resulting normalized duplicate name will overwrite an existing one !!
				const schemaName = path.basename(filename).toLowerCase().replace(/\s/g, '_');
				schemas[schemaName] = JSON.parse(data);
			}
			catch(error)
			{
				logger.error('Could not parse schema file',
					{module: __filename__, error: error});
			}
		});
	});

/**
 * Validate data against a loaded schema by name
 * 
 * @param {string} schemaName - a previously loaded schema name
 * @param {object} data - the data to validate against the schema
 * @param {string[]} [required] - an optional array of required fields
 * @returns {Object} - Object with properties 'valid' {boolean} and optional 'errors' {object}
 */
const Validate = (schemaName, data, required=[]) =>
{
	let schema = schemas[schemaName] || {};
	// optionally add required fields
	if (required.length) schema = Object.assign({}, schema, {required: required});

	return {valid: validator.validate(schemas[schemaName], data), errors: validator.errors};
};