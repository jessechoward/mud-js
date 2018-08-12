const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const basic = require('basic-auth');
const bcrypt = require('bcrypt');
const logger = require('../logging');

const priv_key = fs.readFileSync(path.join(__dirname, '../../certs/rsa_priv.pem'));
const pub_key = fs.readFileSync(path.join(__dirname, '../../certs/rsa_pub.pem'));

const authErrorMsg = (res, username) =>
{
	logger.info('Invalid login attempt', {username: username});
	res.status(401).header().send('Unable to authenticate the requested username and password.');
}

exports.basicAuth = (req, res, next) =>
{
	const creds = basic(req);
	if (creds)
	{
		const user = fs.readFile(path.join(__dirname, '../../players', creds.name), (error, data) =>
		{
			if (error) return authErrorMsg(res, creds.name);
			if (data)
			{
				try
				{
					const user = JSON.parse(data);

					if (user.password)
					{
						bcrypt.compare(creds, user.password)
							.then((result) =>
							{
								if (result)
								{
									const token = jwt.sign({characters: creds.characters}, priv_key,
									{
										algorithm: 'RS256',
										expiresIn: '2 hours'
									});

									return res.status(200).json({data: {token: jwt}});
								}

								return authErrorMsg(res, creds.name);
							})
							.catch((reason) =>
							{
								logger.error('Bcrypt error: ', {username: creds.name, reason: reason});
								return res.status(500).send('Internal system error. Try again in a few minutes.');
							});
					}
				}
				catch(jsonParseError)
				{
					logger.error('Invalid player file format', {name: creds.name, error: jsonParseError});
					return res.status(500).send('Player file corrupted. Please contact an administrator for help.');
				}
			}
		});
	}
};