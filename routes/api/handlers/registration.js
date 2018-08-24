const express = require('express');
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

const validateRequest = (req, res, next) =>
{
	if (jsonschema.validate(regSchema, req.body)) return next();

	return res.status(codes.BAD_REQUEST).json({error: jsonschema.errorsText});
};
exports.validateRequest = validateRequest;

const createAccount = (req, res, next) =>
{
	if (!jsonschema.validate(regSchema, req.body))
	{
		return res.status(codes.BAD_REQUEST).json({error: jsonschema.errorsText});
	}

	db.models.Accounts.findOrCreate({where: {email: req.body.email}, defaults: req.body})
		.spread((account, created) =>
		{
			if (!created)
			{
				return res.status(codes.CONFLICT).json({error: 'Account already exists'});
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
exports.createAccount = createAccount;

exports.register = express.Router().use(validateRequest, createAccount);