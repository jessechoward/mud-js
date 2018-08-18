const Ajv = require('ajv');
const db = require('../../models');
const logger = require('../../src/logging');
const jsonschema = new Ajv();

const registrationSchema =
{

};

module.exports = (req, res, next) =>
{
	jsonschema.validate()
	db.models.Accounts.findOrCreate({where: {email: req.body.email}, defaults: {}})
		.spread((account, created) =>
		{

		})
		.catch((error) =>
		{
			logger.error('Database error on registration', {error: error});
			return res.status(503).json({error: error});
		});
};
