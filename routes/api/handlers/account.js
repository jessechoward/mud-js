const express = require('express');
const Ajv = require('ajv');
const codes = require('http-status-codes');
const db = require('../../../models');
const logger = require('../../../logging');
const jsonschema = new Ajv();

const accountSchema =
{
	'$id': 'Registration',
	type: 'object',
	properties:
	{
		email: {type: 'string', format: 'email'},
		password: {type: 'string', minLength: 8},
		enabled: {type: 'boolean'}
	},
	additionalProperties: false
};

const authorize = (req, res, next) =>
{
	const accountid = req.params.accountid;
	const permissions = req.token.permissions || [];
	return accountid === req.token.accountid || req.token.permissions.includes('admin');
};
exports.authorize = authorize;

const create = (req, res, next) =>
{
	if (!jsonschema.validate(Object.assign({}, accountSchema, {required: ['email', 'password']}), req.body))
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
exports.create = create;

const read = (req, res, next) =>
{
	db.models.Accounts.findById(req.params.accountid)
		.then((account) =>
		{
			req.account = {id: account.id, authenticated: true};
			return next();
		})
		.catch((error) =>
		{
			logger.error('Database error on requesting account by id', {error: error});
			return res.status(codes.INTERNAL_SERVER_ERROR).json({error: error});
		});
};
exports.read = read;

const update = (req, res, next) =>
{
	if (!jsonschema.validate(accountSchema, req.body))
	{
		return res.status(codes.BAD_REQUEST).json({error: jsonschema.errorsText});
	}

	// find the account
	db.models.Accounts.findById(req.params.accountid)
		.then((account) =>
		{
			// limit the fields that can be updated
			account.update(req.body, {fields: ['email', 'password', 'enabled']})
				.then(() =>
				{
					req.account = {id: account.id, authenticated: true};
					return next();
				})
				.catch((error) =>
				{
					logger.error('Database error on updating account by id', {error: error});
					return res.status(codes.INTERNAL_SERVER_ERROR).json({error: error});		
				});
		})
		.catch((error) =>
		{
			logger.error('Database error on requesting account by id', {error: error});
			return res.status(codes.INTERNAL_SERVER_ERROR).json({error: error});
		});
};
exports.update = update;

const destroy = (req, res, next) =>
{
	// find the account
	db.models.Accounts.findById(req.params.accountid)
		.then((account) =>
		{
			if (!account) return res.status(codes.NOT_FOUND).json({error: 'not found'});
			return account.destroy()
				.then(() =>
				{
					return next();
				})
				.catch((error) =>
				{
					return res.status(codes.INTERNAL_SERVER_ERROR).json({error: error});
				});
		})
		.catch((error) =>
		{
			return res.status(codes.INTERNAL_SERVER_ERROR).json({error: error});
		});
};