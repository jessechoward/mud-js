const express = require('express');
const db = require('../../models');
const logger = require('../../src/logging');

// use the same response for any reason we can't authenticate
// even if the user is not found
const unauthorized = (res) =>
{
	return res.status(401)
		.set('WWW-Authenticate', 'Basic realm="mud-js')
		.json({error: 'Authentication Required'});
};

// check for basic credentials
const basic = (req, res, next) =>
{
	const creds = basic(req) || basic.parse('Proxy-Authorization');
	if (!creds) return unauthorized(res);
	// add the credentials to the request object
	request.credentials = creds;
	return next();
};

// perform basic login
const login = (req, res, next) =>
{
	db.models.Accounts.authenticate(req.credentials.name, req.credentials.pass)
		.then((account) =>
		{
			if (account.authenticated)
			{
				// add the account ot the request object
				req.account = account;
				return next();
			}
			// same response whether the passwordis invalid
			// or the user doesn't exist
			return unauthorized(res);
		})
		.catch((error) =>
		{
			// database SHOULD log any db errors before this
			// the user still remains unauthorized
			// we use the same response for every reason
			// even if it is internal so brute force can't identify
			// valid users
			return unauthorized(res);
		});
};

// the exported login method is a combination of checking for
// http basic authorization header and validating the login
exports.login = express.Router().use(basic, login);