const basic = require('basic-auth');
const db = require('../../models');
const logger = require('../../src/logging');

const unauthorized = (res) =>
{
	return res.status(401)
		.set('WWW-Authenticate', 'Basic realm="mud-js.com')
		.json({error: 'Authentication Required'});
};

module.exports = (req, res, next) =>
{
	const creds = basic(req) || basic.parse('Proxy-Authorization');

	if (!creds) return unauthorized(res);

	db.models.Accounts.authenticate(creds.name, creds.pass)
		.then((data) =>
		{
			if (data.authenticated)
			{
				req.authenticated = data;
				return next();
			}
			// same response whether the passwordis invalid
			// or the user doesn't exist
			return unauthorized(res);
		})
		.catch((error) =>
		{
			// database SHOULD log any db errors
			// the user still remains unauthorized
			return unauthorized(res);
		});
};
