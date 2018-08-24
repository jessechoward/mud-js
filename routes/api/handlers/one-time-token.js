const crypto = require('crypto');
const config = require('config');
const express = require('express');
const codes = require('http-status-codes');
const cache = require('../../../cache/redis');

exports.newToken = (req, res, next) =>
{
	const token = crypto.randomBytes(48).update().digest('base64'); 
	cache.set(token, token, config.get('singleUseToken.ttl'))
		.then(() =>
		{
			req.singleUseToken = singleUse;
			return next();
		})
		.catch((error) =>
		{
			return res.status(codes.INTERNAL_SERVER_ERROR)
				.json({error: 'unable to generate one-time-use token'});
		});
};

exports.redeemToken = (req, res, next) =>
{
	cache.get(req.singleUseToken, true)
		.then((token) =>
		{
			if (token) return next();
			else return res.status(codes.NOT_FOUND).json({error: 'not found'});
		})
		.catch((error) =>
		{
			return res.status(codes.INTERNAL_SERVER_ERROR)
				.json({error: 'unable to retreive one-time-use token'});
		});

};