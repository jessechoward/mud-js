const config = require('config');
const bcrypt = require('bcrypt');
const logger = require('../src/logging');
const uuid = require('../src/uuid');
const validateSchema = require('./schemas');

/********************************************************************
 * !!Note!!
 * Preferably the account stuff would be an external
 * RESTful API/service  - especially the password handling stuff.
 * JH - my preference would be to use argon2 at the time of writing
 * via libsodium however there are packaging issues and bcrypt is
 * still more commonly used and subject to more scrutiny.
 ********************************************************************/

/**
 * Handle data requests for account information.
 * Accounts contain personal identifiable information PII
 * such as email addresses (used as login name) and passwords.
 *
 * Once an account has been authenticated, it MUST only be referenced
 * by the account id. Care must be taken what information is logged and
 * who has visibility to that information.
 * 
 * Take note that passwords are one way hashed at time of insertion
 * and are only verified
 */
class Accounts
{
	constructor(redisClient)
	{
		this._redis = redisClient;
	}

	createAccount(newAccount)
	{
		return new Promise((resolve, reject) =>
		{
			const vResult = validateSchema('account', newAccount, ['email', 'password']);
			if (vResult.valid)
			{
				bcrypt.hash(newAccount.password, 10, (error, pwdHash) =>
				{
					if (bcryptError)
					{
						logger.error('Bcrypt error', {module: __filename, error: bcryptError});
						return reject(bcryptError);
					}

					const account = Object.assign({}, newAccount, {id: uuid(), password: pwdHash});
					this._redis.set(`accounts.${account.id}`, `EX ${config.get('newAccountExpire')}`, 'NX', JSON.stringify(account), (redisError, reply) =>
					{
						if (redisError)
						{
							logger.error('Redis error', {module: __filename, error: redisError})
							return reject(redisError);
						}

						if (!reply || reply.toLowercase() !== 'ok')
						{
							logger.error('Trying to create account id that already exists', {module: __filename, error: account});
							return reject({error: 'An account with that id already exists!'});
						}

						return resolve(account.id);
					});
				});
			}
			else
			{
				return reject(vResult.errors);
			}
		});
	}

	updateAccount(id, accountInfo)
	{
		return new Promise((resolve, reject) =>
		{
			// we really only require the id
			// it is assumed there is authentication/authorization done before we
			// get here
			const vResult = validateSchema('account', accountInfo, ['id']);
			if (vResult.valid)
			{
				this._redis.get(`accounts:${id}`, (redisError, reply) =>
				{
					if (redisError)
					{
						logger.error('Redis error', {module: __filename, error: redisError})
						return reject(redisError);
					}

					if (!reply)
					{
						logger.error('Account id not found', {module: __filename, id: id});
						return reject({error: 'not found'});
					}

					const updatedAccount = Object.assign({}, JSON.parse(reply),
					{
						
					})
				});
				// encrypt the password 
				if (accountInfo.password) accountInfo.password = bcrypt.hashSync(newAccount.password, 10,);

				{
					if (bcryptError)
					{
						logger.error('Bcrypt error', {module: __filename, error: bcryptError});
						return reject(bcryptError);
					}

					const account = Object.assign({}, newAccount, {id: uuid(), password: pwdHash});
					this._redis.set(`accounts.${account.id}`, `EX ${config.get('newAccountExpire')}`, 'NX', JSON.stringify(account), (redisError, reply) =>
					{
						if (redisError)
						{
							logger.error('Redis error', {module: __filename, error: redisError})
							return reject(redisError);
						}

						if (!reply || reply.toLowercase() !== 'ok')
						{
							logger.error('Trying to create account id that already exists', {module: __filename, error: account});
							return reject({error: 'An account with that id already exists!'});
						}

						return resolve(account.id);
					});
				});
			}
			else
			{
				return reject(vResult.errors);
			}
		});
	}
}