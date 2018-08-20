const Ajv = require('ajv');
const codes = require('http-status-codes');
const db = require('../../../models');
const cache = require('../../../cache/redis');
const logger = require('../../../logging');
const jsonschema = new Ajv();

const regSchema =
{
	'$id': 'Registration',
	type: 'object',
	properties:
	{
		email: {type: 'string', format: 'email'},
		password: {type: 'string', minLength: 8}
	},
	additionalProperties: false,
	required: ['email', 'password']
};

const validate = (req, res, next) =>
{
	if (jsonschema.validate(regSchema, req.body)) return next();

	return res.status(codes.BAD_REQUEST).json({error: jsonschema.errorsText});
};

const create = (req, res, next) =>
{
	if (!jsonschema.validate(regSchema, req.body))
	{
		return res.status(codes.BAD_REQUEST).json({error: jsonschema.errorsText});
	}

	const overwrite = ['on', 'y', 'yes', 'true', 1, true].includes((req.query.overwrite || '').toLowerCase());

	db.models.Accounts.findOrCreate({where: {email: req.body.email}, defaults: req.body})
		.spread((account, created) =>
		{
			if (!created && (account.validated || !overwrite))
			{
				return res.status(codes.CONFLICT).json({error: 'Account already exists'});
			}
			else if (overwrite && !account.validated)
			{
				account.password = req.body.password;
				account.save()
					.then(() =>
					{
						req.account = {id: account.id, authenticated: true};
						return next();
					})
					.catch((error) =>
					{
						logger.error('Unable to register');
						return res.status(codes.INTERNAL_SERVER_ERROR).json({error: 'unable to create account'});
					})
			}

			req.account = {id: account.id, authenticated: true};
			return next();
		})
		.catch((error) =>
		{
			logger.error('Database error on registration', {error: error});
			return res.status(codes.INTERNAL_SERVER_ERROR).json({error: error});
		});
};

const emailUrl = (req, res, next) =>
{

}
